import {
  Account,
  Blog,
  blog_comment,
  blog_like,
  blog_stat,
  blog_topic,
  bookmark_category,
  bookmark_category_blog,
  PrismaClient,
  Reading_history,
  User,
  User_Profile,
} from '@prisma/client';
import { BlogStatus } from '@prisma/client';
import dayjs, { Dayjs } from 'dayjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function createFakeUser(): Omit<User, 'id'> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: '$2b$10$Tpc1CSiuQvA6f9hqAFgbDOLUgwXwwmnBbU7Z0.k4YgBGWgEPtl5Ea',
    image: faker.image.avatar(),
    username: faker.internet.username(),
    emailVerified: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createFakeProfile(): Omit<User_Profile, 'id' | 'userId'> {
  return {
    bio: faker.lorem.paragraph(),
    tagline: faker.lorem.sentence(),
    location: faker.location.city(),
    website_url: faker.internet.url(),
    github_url: faker.internet.url(),
    linkedin_url: faker.internet.url(),
    twitter_url: faker.internet.url(),
    available_for: faker.lorem.sentence(),
    tech_stack: faker.lorem.sentence(),
    followers_count: faker.number.int({ min: 0, max: 1000 }),
    following_count: faker.number.int({ min: 0, max: 1000 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createFakeAccount(): Omit<Account, 'id' | 'userId'> {
  return {
    provider: 'google',
    providerAccountId: faker.string.uuid(),
    type: 'oauth',
    token_type: 'Bearer',
    refresh_token: faker.string.uuid(),
    access_token: faker.string.uuid(),
    expires_at: faker.number.int({ min: 1, max: 1000000 }),
    scope: 'read:user',
    id_token: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBookmarkCategory(userId: string): Omit<bookmark_category, 'id'> {
  return {
    title: faker.vehicle.vehicle(),
    description: faker.lorem.sentence(),
    userId,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBookmarkCategoryBlog(
  categoryId: string,
  blogId: string
): Omit<bookmark_category_blog, 'id'> {
  return {
    categoryId,
    blogId,
    note: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBlogLike(userId: string, blogId: string): Omit<blog_like, 'id'> {
  return {
    userId,
    blogId,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBlogComment(
  userId: string,
  blogId: string
): Omit<blog_comment, 'id'> {
  return {
    userId,
    blogId,
    content: faker.lorem.paragraphs(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createTopic(): Omit<blog_topic, 'id'> {
  return {
    title: faker.lorem.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBlogs(authorId: string, topicId: string): Omit<Blog, 'id'> {
  return {
    title: faker.lorem.sentence(),
    html_content: faker.lorem.paragraphs(),
    markdown_content: faker.lorem.paragraphs(),
    banner_img: faker.image.urlPicsumPhotos({ width: 1080, height: 920 }),
    authorId,
    topicId,
    number_of_views: faker.number.int({ min: 0, max: 1000 }),
    number_of_likes: faker.number.int({ min: 0, max: 1000 }),
    number_of_comments: faker.number.int({ min: 0, max: 1000 }),
    blog_status: BlogStatus.PUBLISHED,
    short_description: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function generateBlogStats(
  blogId: string,
  date: string
): Omit<blog_stat, 'id'> {
  return {
    blogId,
    number_of_views: faker.number.int({ max: 1000 }),
    number_of_likes: faker.number.int({ max: 1000 }),
    number_of_comments: faker.number.int({ max: 1000 }),
    date,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createReadingHistory(
  userId: string,
  blogId: string
): Omit<Reading_history, 'id'> {
  return {
    userId,
    blogId,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

const pushUser = async () => {
  const user = createFakeUser();
  const profile = createFakeProfile();
  const account1 = createFakeAccount();
  const account2 = createFakeAccount();
  return await prisma.user.create({
    data: {
      ...user,
      profile: { create: profile },
      accounts: { create: [account1, account2] },
    },
    include: {
      profile: true,
      accounts: true,
    },
  });
};

const pushTopic = async () => {
  const topic = createTopic();
  return await prisma.blog_topic.create({ data: topic });
};

const pushBlogs = async (authorId: string, topicId: string) => {
  const blog = createBlogs(authorId, topicId);
  return await prisma.blog.create({ data: blog });
};

const pushBlogComment = async (userId: string, blogId: string) => {
  const blogComment = createBlogComment(userId, blogId);
  return await prisma.blog_comment.create({ data: blogComment });
};

const pushBlogLike = async (userId: string, blogId: string) => {
  const blogLike = createBlogLike(userId, blogId);
  return await prisma.blog_like.create({ data: blogLike });
};

async function seedFakeData() {
  try {
    // await prisma.blog_like.deleteMany();
    // await prisma.blog_comment.deleteMany();
    // await prisma.blog.deleteMany();
    // await prisma.blog_topic.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.bookmark_category.deleteMany();
    // await prisma.bookmark_category_blog.deleteMany();
    const userIds: string[] = [];
    const topicIds: string[] = [];
    const blogIds: string[] = [];
    for (let i = 0; i < 30; i++) {
      const user = await pushUser();
      userIds.push(user.id);
    }
    for (let i = 0; i < 20; i++) {
      const topic = await pushTopic();
      topicIds.push(topic.id);
    }

    for (let i = 0; i < userIds.length; i++) {
      const blog = await pushBlogs(
        userIds[i],
        faker.helpers.arrayElement(topicIds)
      );
      blogIds.push(blog.id);
    }
    for (let i = 0; i < blogIds.length; i++) {
      for (
        let j = 0;
        j < faker.number.int({ min: 0, max: userIds.length });
        j++
      ) {
        await pushBlogComment(userIds[j], blogIds[i]);
      }
    }
    for (let i = 0; i < blogIds.length; i++) {
      for (
        let j = 0;
        j < faker.number.int({ min: 0, max: userIds.length });
        j++
      ) {
        await pushBlogLike(userIds[j], blogIds[i]);
      }
    }
    const blogStatsArr: any = [];
    blogIds.forEach((blogId) => {
      let temp = dayjs().subtract(365, 'day');
      for (let i = 0; i < 365; i++) {
        let addedDate = temp.add(1, 'day');
        let date = addedDate.format('YYYY-MM-DD');
        temp = addedDate;
        blogStatsArr.push(generateBlogStats(blogId, date));
      }
    });
    await prisma.blog_stat.createMany({ data: blogStatsArr });
    console.log('DB seeded with fake data');
    await prisma.$disconnect();
    process.exit(1);
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

console.log('Seeding fake data');
seedFakeData();
