import 'dotenv/config';
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
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';
import { s3Client, uploadToS3 } from '../src/utils/s3';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

interface MarkdownFile {
  originalName: string;
  fileName: string;
  fileUrl: string;
  content: string;
}

async function uploadMarkdownFiles(
  folderPath: string
): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = [];

  try {
    const fileNames = await fs.readdir(folderPath);
    for (const originalName of fileNames) {
      if (originalName.endsWith('.md')) {
        const filePath = path.join(folderPath, originalName);
        const content = await fs.readFile(filePath, 'utf-8');
        const fileName = `blogs/seed/${uuidv4()}.md`;
        const { fileUrl } = await uploadToS3(
          process.env.AWS_BUCKET_NAME!,
          fileName,
          content
        );
        files.push({
          originalName,
          fileName,
          fileUrl,
          content,
        });
      }
    }
    return files;
  } catch (error) {
    console.error('Error uploading markdown files:', error);
    throw error;
  }
}

function createBlogs(
  authorId: string,
  topicId: string,
  markdownFile: MarkdownFile
): Omit<Blog, 'id'> {
  return {
    title: faker.lorem.sentence(),
    markdown_file_name: markdownFile.fileName,
    markdown_file_url: markdownFile.fileUrl,
    reading_time: faker.number.int({ min: 1, max: 10 }),
    embeddings: createEmbeddings(markdownFile.content),
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

function createEmbeddings(text: string) {
  // This is a mock function - replace with actual embedding creation
  return Array(1536)
    .fill(0)
    .map(() => Math.random());
}

function createFakeUser(hashedPassword: string): Omit<User, 'id'> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: hashedPassword,
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
  const hashedPassword = await hash('PAssword!@12', 10);
  const user = createFakeUser(hashedPassword);
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

const pushBlogs = async (
  authorId: string,
  topicId: string,
  markdownFile: MarkdownFile
) => {
  const blog = createBlogs(authorId, topicId, markdownFile);
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

const getAllFilesFromS3 = async (
  bucketName: string
): Promise<MarkdownFile[]> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      originalName: item.Key!.split('/').pop()!,
      fileName: item.Key!.split('/').pop()!,
      fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
      content: '',
    }));
  } catch (error) {
    console.error('Error listing files from S3:', error);
    throw new Error('Failed to list files from S3');
  }
};

async function seedFakeData() {
  try {
    const markdownFiles = await getAllFilesFromS3(process.env.AWS_BUCKET_NAME!);
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

    // Create blogs using the uploaded markdown files
    for (let i = 0; i < userIds.length; i++) {
      for (let j = 0; j < faker.number.int({ min: 1, max: 10 }); j++) {
        const blog = await prisma.blog.create({
          data: createBlogs(
            userIds[i],
            faker.helpers.arrayElement(topicIds),
            faker.helpers.arrayElement(markdownFiles)
          ),
        });
        blogIds.push(blog.id);
      }
    }

    // Create comments and likes
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

    for (const userId of userIds) {
      const numCategories = faker.number.int({ min: 3, max: 10 });
      for (let i = 0; i < numCategories; i++) {
        const category = await prisma.bookmark_category.create({
          data: createBookmarkCategory(userId),
        });
        const numBookmarks = faker.number.int({ min: 5, max: 20 });
        const randomBlogIds = faker.helpers.arrayElements(
          blogIds,
          numBookmarks
        );
        for (const blogId of randomBlogIds) {
          await prisma.bookmark_category_blog.create({
            data: createBookmarkCategoryBlog(category.id, blogId),
          });
        }
      }
    }

    // Create blog stats
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
  } catch (error) {
    console.error('Seeding error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// (async () => {
//   console.log('pushing files to s3');
//   console.log(process.cwd());
//   await uploadMarkdownFiles(path.join(process.cwd(), 'seeding-data'));
//   console.log('pushing files to s3 done');
//   const markdownFiles = await getAllFilesFromS3(process.env.AWS_BUCKET_NAME!);
//   console.log(`Found ${markdownFiles.length} markdown files in S3`);
// })();
console.log('Starting seed process...');
seedFakeData();
