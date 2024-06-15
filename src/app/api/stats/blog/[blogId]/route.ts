import { db } from '@/db/drizzle';
import { blogStats, readingHistories } from '@/db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { NextRequest, NextResponse } from 'next/server';
import { StatsResponse } from '../../route';

dayjs.extend(isBetween);

const getUrlFromReferrer = (referrer: string) => {
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch (error) {
    return 'Unknown';
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blogId = searchParams.get('blogId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!blogId || !startDate || !endDate) {
    throw new Error('Blog ID and dates are required');
  }

  if (
    !startDate.match(/^\d{4}-\d{2}-\d{2}$/) ||
    !endDate.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    throw new Error('Dates must be in YYYY-MM-DD format');
  }

  const stats = await db
    .select()
    .from(blogStats)
    .where(
      and(
        eq(blogStats.blogId, blogId),
        gte(blogStats.createdAt, new Date(startDate).toISOString()),
        lte(blogStats.createdAt, new Date(endDate).toISOString())
      )
    )
    .orderBy(blogStats.createdAt);

  const readingHistory = await db
    .select()
    .from(readingHistories)
    .where(
      and(
        eq(readingHistories.blogId, blogId),
        gte(readingHistories.createdAt, new Date(startDate)),
        lte(readingHistories.createdAt, new Date(endDate))
      )
    )
    .orderBy(readingHistories.createdAt);

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
      blogs: [],
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

  let statsPointer = 0;
  let datesPointer = 0;
  let chartPointer = 0;

  while (datesPointer < allDates.length) {
    const currentDate = allDates[datesPointer];
    const currentStat = stats[statsPointer];

    if (!currentStat || dayjs(currentStat.createdAt).isAfter(currentDate)) {
      result.chartData.reaction.views[chartPointer] = 0;
      result.chartData.reaction.likes[chartPointer] = 0;
      result.chartData.reaction.comments[chartPointer] = 0;
      datesPointer++;
      chartPointer++;
    } else if (dayjs(currentStat.createdAt).isSame(currentDate)) {
      result.chartData.reaction.views[chartPointer] = currentStat.numberOfViews;
      result.chartData.reaction.likes[chartPointer] = currentStat.numberOfLikes;
      result.chartData.reaction.comments[chartPointer] =
        currentStat.numberOfComments;
      result.totals.total_views += currentStat.numberOfViews;
      result.totals.total_likes += currentStat.numberOfLikes;
      result.totals.total_comments += currentStat.numberOfComments;
      statsPointer++;
      datesPointer++;
      chartPointer++;
    } else {
      statsPointer++;
    }
  }

  return NextResponse.json(result);
}
