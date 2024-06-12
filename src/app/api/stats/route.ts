import { NextRequest, NextResponse } from 'next/server';
import prisma from '@prisma_client/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Blog, blog_stat } from '@prisma/client';

dayjs.extend(isBetween);

interface IPercentageTable {
  [key: string]: number;
  total: number;
}

export interface StatsResponse {
  chartData: {
    reaction: {
      dates: string[];
      views: number[];
      likes: number[];
      comments: number[];
    };
    referrers: IPercentageTable;
    browsers: IPercentageTable;
    operating_systems: IPercentageTable;
    devices: IPercentageTable;
    blogs: Partial<Blog>[];
  };
  totals: {
    total_views: number;
    total_likes: number;
    total_comments: number;
  };
}

const getUrlFromReferrer = (referrer: string) => {
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch (error) {
    return 'Unknown';
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      throw new Error('Start and end dates are required');
    }

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Get all blogs by the user
    const userBlogs = await prisma.blog.findMany({
      where: {
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        number_of_comments: true,
        number_of_likes: true,
        number_of_views: true,
        reading_time: true,
        createdAt: true,
        banner_img: true,
      },
    });
    const blogIds = userBlogs.map((blog) => blog.id);
    const readingHistory = await prisma.reading_history.findMany({
      where: {
        blogId: {
          in: blogIds,
        },
        // createdAt: {
        //   gte: endDate,
        //   lte: startDate,
        // },
        AND: [
          {
            createdAt: {
              gte: endDate,
            },
          },
          {
            createdAt: {
              lte: startDate,
            },
          },
        ],
      },
    });
    // Get stats for all user's blogs within date range
    const stats = await prisma.blog_stat.findMany({
      where: {
        blogId: {
          in: blogIds,
        },
        createdAt: {
          gte: endDate,
          lte: startDate,
        },
        // AND: [
        //   {
        //     createdAt: {
        //       gte: new Date(endDate + ' 00:00:00'),
        //     },
        //   },
        //   {
        //     createdAt: {
        //       lte: new Date(startDate + ' 23:59:59'),
        //     },
        //   },
        // ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    console.log(
      startDate,
      endDate,
      stats.length,
      'stats',
      blogIds,
      blogIds.length,
      'blogIds',
      readingHistory.length,
      'readingHistory'
    );
    const allDates: string[] = [];
    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);
    const numberOfDays = lastDate.diff(currentDate, 'day') + 1;
    const steps = Math.ceil(numberOfDays / 31);
    while (
      currentDate.isBefore(lastDate, 'day') ||
      currentDate.isSame(lastDate, 'day')
    ) {
      allDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(steps || 1, 'day');
    }

    let currentBlogIndex = 0;
    const allBlogsStats: blog_stat[][] = [];
    const blogIndexHashMap: Record<string, number> = {};
    for (let i = 0; i < stats.length; i++) {
      const blogIndex = blogIndexHashMap[stats[i].blogId];
      if (!blogIndex) {
        blogIndexHashMap[stats[i].blogId] = currentBlogIndex;
        allBlogsStats.push([]);
        currentBlogIndex++;
      }
      const blogStatsArray = allBlogsStats[blogIndex];
      blogStatsArray?.push(stats[i]);
    }
    const result: StatsResponse = {
      chartData: {
        reaction: {
          dates: allDates,
          views: [],
          likes: [],
          comments: [],
        },
        referrers: {
          total: 0,
        },
        browsers: {
          total: 0,
        },
        operating_systems: {
          total: 0,
        },
        devices: {
          total: 0,
        },
        blogs: userBlogs,
      },
      totals: {
        total_views: 0,
        total_likes: 0,
        total_comments: 0,
      },
    };

    for (let i = 0; i < readingHistory.length; i++) {
      const readingHistoryItem = readingHistory[i];
      const referrer =
        getUrlFromReferrer(readingHistoryItem?.referrer || '') || 'Unknown';
      if (result?.chartData?.referrers[referrer]) {
        result.chartData.referrers[referrer] += 1;
      } else {
        result.chartData.referrers[referrer] = 1;
      }
      result.chartData.referrers.total += 1;

      const browser = readingHistoryItem?.browser || 'Unknown';
      if (result?.chartData?.browsers[browser]) {
        result.chartData.browsers[browser] += 1;
      } else {
        result.chartData.browsers[browser] = 1;
      }
      result.chartData.browsers.total += 1;

      const operatingSystem = readingHistoryItem?.os || 'Unknown';
      if (result?.chartData?.operating_systems[operatingSystem]) {
        result.chartData.operating_systems[operatingSystem] += 1;
      } else {
        result.chartData.operating_systems[operatingSystem] = 1;
      }
      result.chartData.operating_systems.total += 1;

      const device = readingHistoryItem?.device || 'Unknown';
      if (result?.chartData?.devices[device]) {
        result.chartData.devices[device] += 1;
      } else {
        result.chartData.devices[device] = 1;
      }
      result.chartData.devices.total += 1;
    }

    for (let i = 0; i < allBlogsStats.length; i++) {
      const blogStatsArray = allBlogsStats[i];
      const tempReactionsObj: StatsResponse['chartData']['reaction'] = {
        dates: [],
        views: [],
        likes: [],
        comments: [],
      };
      const tempTotalsObj: StatsResponse['totals'] = {
        total_views: 0,
        total_likes: 0,
        total_comments: 0,
      };
      let statsPointer = 0;
      let datesPointer = 0;
      let chartPointer = 0;

      while (datesPointer < allDates.length) {
        const currentDate = allDates[datesPointer];
        const currentStat = blogStatsArray[statsPointer];

        if (!currentStat || dayjs(currentStat.createdAt).isAfter(currentDate)) {
          tempReactionsObj.views[chartPointer] = 0;
          tempReactionsObj.likes[chartPointer] = 0;
          tempReactionsObj.comments[chartPointer] = 0;
          datesPointer++;
          chartPointer++;
        } else if (dayjs(currentStat.createdAt).isSame(currentDate)) {
          tempReactionsObj.views[chartPointer] = currentStat.number_of_views;
          tempReactionsObj.likes[chartPointer] = currentStat.number_of_likes;
          tempReactionsObj.comments[chartPointer] =
            currentStat.number_of_comments;
          tempTotalsObj.total_views += currentStat.number_of_views;
          tempTotalsObj.total_likes += currentStat.number_of_likes;
          tempTotalsObj.total_comments += currentStat.number_of_comments;
          statsPointer++;
          datesPointer++;
          chartPointer++;
        } else {
          statsPointer++;
        }
      }

      for (let j = 0; j < allDates.length; j++) {
        if (!result.chartData.reaction.views[j]) {
          result.chartData.reaction.views[j] = 0;
        }
        if (!result.chartData.reaction.likes[j]) {
          result.chartData.reaction.likes[j] = 0;
        }
        if (!result.chartData.reaction.comments[j]) {
          result.chartData.reaction.comments[j] = 0;
        }
        result.chartData.reaction.views[j] += tempReactionsObj.views[j];
        result.chartData.reaction.likes[j] += tempReactionsObj.likes[j];
        result.chartData.reaction.comments[j] += tempReactionsObj.comments[j];
      }
      result.totals.total_views += tempTotalsObj.total_views;
      result.totals.total_likes += tempTotalsObj.total_likes;
      result.totals.total_comments += tempTotalsObj.total_comments;
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
