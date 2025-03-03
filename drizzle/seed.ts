import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, uploadToS3 } from '../src/utils/s3';
import fsPromises from 'fs/promises';
import path from 'path';
import * as schema from '../src/db/schema';
import {
  blogStatusEnum,
  users,
  profiles,
  accounts,
  bookmarkCategories,
  bookmarkCategoryBlogs,
  blogLikes,
  blogComments,
  blogStats,
  readingHistories,
  blogs,
} from '../src/db/schema';
import dayjs from 'dayjs';
import { TUnsplashResponse } from './types';
import fs from 'fs';

// Initialize PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL!,
  ssl: false,
});

const db = drizzle(client, { schema });

interface MarkdownFile {
  originalName: string;
  fileName: string;
  fileUrl: string;
  content: string;
}

const sampleBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

const sampleReferrers = [
  'https://google.com/asdasdad',
  'https://twitter.com/asdasdad',
  'https://facebook.com/asdasdad',
  'https://linkedin.com/asdasdad',
  'https://github.com/asdasdad',
  'https://dev.to/asdasdad',
  'https://medium.com/asdasdad',
  'https://reddit.com/asdasdad',
  'https://bing.com/asdasdad',
  'https://stackoverflow.com/asdasdad',
];

const sampleOperatingSystems = ['Windows', 'macOS', 'Linux', 'iOS'];
const devices = ['android', 'desktop', 'tablet'];

// async function uploadMarkdownFiles(
//   folderPath: string
// ): Promise<MarkdownFile[]> {
//   const files: MarkdownFile[] = [];

//   try {
//     const fileNames = await fs.readdir(folderPath);
//     for (const originalName of fileNames) {
//       if (originalName.endsWith('.md')) {
//         const filePath = path.join(folderPath, originalName);
//         const content = await fs.readFile(filePath, 'utf-8');
//         const fileName = `blogs/seed/${uuidv4()}.md`;
//         const { fileUrl } = await uploadToS3(
//           process.env.AWS_BUCKET_NAME!,
//           fileName,
//           content
//         );
//         files.push({
//           originalName,
//           fileName,
//           fileUrl,
//           content,
//         });
//       }
//     }
//     return files;
//   } catch (error) {
//     console.error('Error uploading markdown files:', error);
//     throw error;
//   }
// }

function createBlogs(
  authorId: string,
  imageUrl: string,
  blogObject: IJSONBlog,
  content: string
): Omit<typeof blogs.$inferInsert, 'id'> {
  return {
    title: blogObject.title,
    // markdownFileName: markdownFile.fileName,
    // markdownFileUrl: markdownFile.fileUrl,
    // embeddings: createEmbeddings(markdownFile.content),
    content: blogObject.article,
    readingTime: faker.number.int({ min: 1, max: 10 }),
    // bannerImg: faker.image.urlPicsumPhotos({ width: 1080, height: 920 }),
    bannerImg: imageUrl,
    authorId,
    tags: blogObject?.keywords?.split(','),
    numberOfViews: faker.number.int({ min: 0, max: 1000 }),
    numberOfLikes: faker.number.int({ min: 0, max: 1000 }),
    numberOfComments: faker.number.int({ min: 0, max: 1000 }),
    blogStatus: blogStatusEnum.enumValues[0],
    shortDescription: blogObject?.description?.split(' [...]')[0],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createEmbeddings(text: string) {
  // This is a mock function - replace with actual embedding creation
  return Array(1536)
    .fill(0)
    .map(() => faker.number.int({ min: 0, max: 1000 }));
}

function createFakeUser(
  hashedPassword: string
): Omit<typeof users.$inferInsert, 'id'> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: hashedPassword,
    image: faker.image.avatar(),
    username: faker.internet.username().toLowerCase(),
    emailVerified: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createFakeProfile(): Omit<
  typeof profiles.$inferInsert,
  'id' | 'userId'
> {
  return {
    bio: faker.lorem.paragraph(),
    tagline: faker.lorem.sentence(),
    location: faker.location.city(),
    websiteUrl: faker.internet.url(),
    githubUrl: faker.internet.url(),
    linkedinUrl: faker.internet.url(),
    twitterUrl: faker.internet.url(),
    availableFor: faker.lorem.sentence(),
    techStack: faker.lorem.sentence(),
    followersCount: faker.number.int({ min: 0, max: 1000 }),
    followingCount: faker.number.int({ min: 0, max: 1000 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createFakeAccount(): Omit<
  typeof accounts.$inferInsert,
  'id' | 'userId'
> {
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
  };
}

function createBookmarkCategory(
  userId: string
): Omit<typeof bookmarkCategories.$inferInsert, 'id'> {
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
  blogId: string,
  userId: string
): Omit<typeof bookmarkCategoryBlogs.$inferInsert, 'id'> {
  return {
    categoryId,
    blogId,
    bookmarkedByUserId: userId,
    note: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function createBlogLike(
  userId: string,
  blogId: string
): Omit<typeof blogLikes.$inferInsert, 'id'> {
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
): Omit<typeof blogComments.$inferInsert, 'id'> {
  return {
    userId,
    blogId,
    content: faker.lorem.paragraphs(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

function generateBlogStats(
  blogId: string,
  createdAt: Date
): Omit<typeof blogStats.$inferInsert, 'id'> {
  return {
    blogId,
    numberOfViews: faker.number.int({ max: 1000 }),
    numberOfLikes: faker.number.int({ max: 1000 }),
    numberOfComments: faker.number.int({ max: 1000 }),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.past(),
  };
}

function createReadingHistory(
  blogId: string,
  userId?: string
): Omit<typeof readingHistories.$inferInsert, 'id'> {
  return {
    userId: userId || '',
    blogId,
    referrer: faker.helpers.arrayElement(sampleReferrers),
    browser: faker.helpers.arrayElement(sampleBrowsers),
    os: faker.helpers.arrayElement(sampleOperatingSystems),
    device: faker.helpers.arrayElement(devices),
    ipAddress: faker.internet.ip(),
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

  const [createdUser] = await db.insert(schema.users).values(user).returning();

  await db.insert(schema.profiles).values({
    ...profile,
    userId: createdUser.id,
  });

  await db.insert(schema.accounts).values([
    { ...account1, userId: createdUser.id },
    { ...account2, userId: createdUser.id },
  ]);

  return createdUser;
};

// const pushBlogs = async (
//   authorId: string,
//   topicId: string,
//   imageUrl: string,
//   blogObject: IJSONBlog
// ) => {
//   const blog = createBlogs(authorId, imageUrl, blogObject);
//   const [createdBlog] = await db.insert(schema.blogs).values(blog).returning();
//   return createdBlog;
// };

const pushBlogComment = async (userId: string, blogId: string) => {
  const blogComment = createBlogComment(userId, blogId);
  const [createdComment] = await db
    .insert(schema.blogComments)
    .values(blogComment)
    .returning();
  return createdComment;
};

const pushBlogLike = async (userId: string, blogId: string) => {
  const blogLike = createBlogLike(userId, blogId);
  const [createdLike] = await db
    .insert(schema.blogLikes)
    .values(blogLike)
    .returning();
  return createdLike;
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

const resetTheDatabase = async () => {
  await db.delete(schema.profiles);
  await db.delete(schema.accounts);
  await db.delete(schema.sessions);
  await db.delete(schema.blogComments);
  await db.delete(schema.blogLikes);
  await db.delete(schema.blogStats);
  await db.delete(schema.bookmarkCategories);
  await db.delete(schema.bookmarkCategoryBlogs);
  await db.delete(schema.readingHistories);
  await db.delete(schema.blogs);
  await db.delete(schema.users);
};

interface IJSONBlog {
  _id: { $oid: string };
  title: string;
  datePublished: string;
  description: string;
  article: string;
  keywords: string;
}

/**
 * Creates a well-formatted markdown article from an array of blog data and images
 * @param data Array of blog data with article content
 * @param imageUrls Array of image URLs to insert into the article
 * @returns A formatted markdown article with proper syntax and structure
 */
const createMarkdownArticle = (
  data: IJSONBlog[],
  imageUrls: string[]
): string => {
  // Ensure we have data to work with
  if (!data.length) {
    return '';
  }

  let markdownContent = '';
  let imageIndex = 0;

  // Add title as main heading
  markdownContent += `# ${data[0].title}\n\n`;

  // Add publication date
  markdownContent += `*Published on: ${new Date(
    data[0].datePublished
  ).toLocaleDateString()}*\n\n`;

  // Add description as introduction
  markdownContent += `## Introduction\n\n${data[0].description}\n\n`;

  // Process each blog entry to create sections
  data.forEach((blog, index) => {
    // Create section headers for each blog entry after the first
    if (index > 0) {
      markdownContent += `## Section ${index}: ${blog.title}\n\n`;
    }

    // Split the article text into paragraphs
    const paragraphs = blog.article
      .split(/\n+/)
      .filter((p) => p.trim().length > 0);

    // Process each paragraph
    paragraphs.forEach((paragraph, pIndex) => {
      // Add subheadings occasionally
      if (pIndex % 3 === 0 && pIndex > 0) {
        markdownContent += `### ${paragraph?.split('.')[0]}.\n\n`;
      }

      // Format some paragraphs with emphasis or strong emphasis
      if (pIndex % 5 === 0) {
        markdownContent += `*${paragraph}*\n\n`;
      } else if (pIndex % 7 === 0) {
        markdownContent += `**${paragraph}**\n\n`;
      } else {
        markdownContent += `${paragraph}\n\n`;
      }

      // Add an image after some paragraphs
      if (pIndex % 4 === 1 && imageIndex < imageUrls.length) {
        markdownContent += `![Image ${imageIndex + 1}](${
          imageUrls[imageIndex]
        })\n\n`;
        imageIndex = (imageIndex + 1) % imageUrls.length;
      }

      // Add blockquotes occasionally
      if (pIndex % 6 === 0 && paragraph.length > 50) {
        const quote = paragraph.substring(0, 50) + '...';
        markdownContent += `> ${quote}\n\n`;
      }

      // Add a horizontal rule occasionally
      if (pIndex % 8 === 0 && pIndex > 0) {
        markdownContent += `---\n\n`;
      }

      // Add a list occasionally
      if (pIndex % 9 === 0) {
        const keywords = blog.keywords?.split(',').map((k) => k.trim());
        if (keywords?.length > 1) {
          markdownContent += `Related topics:\n\n`;
          keywords.forEach((keyword) => {
            markdownContent += `- ${keyword}\n`;
          });
          markdownContent += `\n`;
        }
      }
    });

    // Add a link to related content
    if (index < data.length - 1) {
      markdownContent += `[Read more about ${data[index + 1].title}](#section-${
        index + 1
      })\n\n`;
    }
  });

  // Add a conclusion section
  markdownContent += `## Conclusion\n\n`;
  markdownContent += `This article covered various aspects of ${data[0].title}. `;
  markdownContent += `We hope you found this information useful and insightful.\n\n`;

  // Ensure the article meets the minimum length requirement (2000 characters)
  if (markdownContent.length < 2000) {
    markdownContent += `## Additional Information\n\n`;

    // Add more content to reach the minimum length
    while (markdownContent.length < 2000) {
      const randomBlog = data[Math.floor(Math.random() * data.length)];
      markdownContent += `${randomBlog.article}\n\n`;

      if (imageIndex < imageUrls.length) {
        markdownContent += `![Additional Image ${imageIndex + 1}](${
          imageUrls[imageIndex]
        })\n\n`;
        imageIndex = (imageIndex + 1) % imageUrls.length;
      }
    }
  }

  return markdownContent;
};

const fetchImagesFromUnsplash = async (page_no: number = 1) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=${page_no}&per_page=30&query=nature&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );
    const jsondata: TUnsplashResponse = await res.json();
    return jsondata;
  } catch (error) {
    return null;
  }
};

const getRandomImages = async (): Promise<TUnsplashResponse['results']> => {
  const pathTofile = path.join(
    __dirname,
    'seed_cached_data',
    'unsplash-data.json'
  );
  const fileData = await fsPromises.readFile(pathTofile, {
    encoding: 'utf8',
  });
  if (fileData) {
    const jsonFileData: TUnsplashResponse = JSON.parse(fileData);
    return jsonFileData.results;
  } else {
    const data = await fetchImagesFromUnsplash();
    if (!data) throw Error('Error fetching data from Unsplash');
    fs.writeFileSync(pathTofile, JSON.stringify(data, null, 2));
    return data.results;
  }
};

async function getUnsplashImages(numberOfImages: number): Promise<any[]> {
  const filePath = path.join(
    process.cwd(),
    'drizzle',
    'seed-data',
    'unsplash-data.json'
  );

  // Check if directory exists, create if it doesn't
  const dirPath = path.dirname(filePath);
  try {
    await fsPromises.access(dirPath);
  } catch (error) {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }

  // Check if file exists
  let allResults: any[] = [];
  try {
    await fsPromises.access(filePath);
    // File exists, read and return data
    const fileData = await fsPromises.readFile(filePath, 'utf-8');
    const JSONImages = JSON.parse(fileData);
    allResults = JSONImages.results;
  } catch (error) {
    // File doesn't exist or can't be read, fetch new data
    console.log('Fetching images from Unsplash API...');
  }

  // If the number of images is less than required, fetch more
  if (allResults.length < numberOfImages) {
    const totalPages = Math.ceil((numberOfImages - allResults.length) / 30); // Calculate pages needed
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching page ${page}/${totalPages}...`);
      const data = await fetchImagesFromUnsplash(page);

      if (!data) {
        console.error(`Failed to fetch page ${page}`);
        continue;
      }

      allResults.push(...data.results);

      // API rate limit is 50 requests/hour, so we need to be careful
      if (allResults.length < numberOfImages && page < totalPages) {
        console.log('Waiting 5 seconds before next request...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // Save the fetched data
    await fsPromises.writeFile(
      filePath,
      JSON.stringify({ results: allResults }, null, 2)
    );
  }

  return allResults.slice(0, numberOfImages); // Return only the requested number of images
}

async function seedFakeData() {
  const imagesArr = await getUnsplashImages(1500);
  try {
    await client.connect();
    await resetTheDatabase();
    // const markdownFiles = await getAllFilesFromS3(process.env.AWS_BUCKET_NAME!);
    const JSONBlogs: IJSONBlog[] = JSON.parse(
      await fsPromises.readFile(
        path.join(process.cwd(), 'drizzle', 'seed-data', 'article-2020.json'),
        'utf-8'
      )
    );
    const userIds: string[] = [];
    const topicIds: string[] = [];
    const blogIds: string[] = [];

    // Create users
    for (let i = 0; i < 30; i++) {
      const user = await pushUser();
      userIds.push(user.id);
    }

    // Create guest user with profile and accounts in a transaction
    const guestUserData = await db.transaction(async (tx) => {
      const [guestUser] = await tx
        .insert(schema.users)
        .values({
          name: 'Guest',
          email: 'guest@example.com',
          password: await hash('Password!@12', 10),
          image: faker.image.avatar(),
          username: faker.internet.username().toLowerCase(),
          emailVerified: null,
          createdAt: faker.date.past(),
          updatedAt: faker.date.past(),
        })
        .returning();

      const [profile] = await tx
        .insert(schema.profiles)
        .values({
          ...createFakeProfile(),
          userId: guestUser.id,
        })
        .returning();

      const accounts = await tx
        .insert(schema.accounts)
        .values([
          { ...createFakeAccount(), userId: guestUser.id },
          { ...createFakeAccount(), userId: guestUser.id },
        ])
        .returning();

      return { guestUser, profile, accounts };
    });
    userIds.push(guestUserData.guestUser.id);

    // Create blogs
    let currentJSONBlogInd = 0;
    for (let i = 0; i < userIds.length; i++) {
      for (let j = 0; j < faker.number.int({ min: 10, max: 50 }); j++) {
        const blogImages = faker.helpers
          .arrayElements(imagesArr, { min: 4, max: 10 })
          .map((el) => el.urls.regular);
        const blogContent = createMarkdownArticle(
          faker.helpers.arrayElements(JSONBlogs, { min: 4, max: 10 }),
          blogImages
        );
        const [blog] = await db
          .insert(schema.blogs)
          .values(
            createBlogs(
              userIds[i],
              faker.helpers.arrayElement(imagesArr).urls.regular,
              JSONBlogs[currentJSONBlogInd],
              blogContent
            )
          )
          .returning();
        blogIds.push(blog.id);
        currentJSONBlogInd++;
      }
    }

    // Create comments and likes in batch
    for (const blogId of blogIds) {
      const numComments = faker.number.int({ min: 100, max: 1000 });
      const numLikes = faker.number.int({ min: 100, max: 1000 });

      const commentValues = Array.from({ length: numComments }, () =>
        createBlogComment(faker.helpers.arrayElement(userIds), blogId)
      );
      const likeValues = Array.from({ length: numLikes }, () =>
        createBlogLike(faker.helpers.arrayElement(userIds), blogId)
      );

      await db.insert(schema.blogComments).values(commentValues);
      await db.insert(schema.blogLikes).values(likeValues);
    }

    // Create bookmark categories and their blogs in transactions
    for (const userId of userIds) {
      const numCategories = faker.number.int({ min: 3, max: 10 });

      for (let i = 0; i < numCategories; i++) {
        await db.transaction(async (tx) => {
          const [category] = await tx
            .insert(schema.bookmarkCategories)
            .values(createBookmarkCategory(userId))
            .returning();

          const numBookmarks = faker.number.int({ min: 5, max: 20 });
          const randomBlogIds = faker.helpers.arrayElements(
            blogIds,
            numBookmarks
          );

          await tx
            .insert(schema.bookmarkCategoryBlogs)
            .values(
              randomBlogIds.map((blogId) =>
                createBookmarkCategoryBlog(category.id, blogId, userId)
              )
            );
        });
      }
    }

    // Create reading histories in batch
    for (const blogId of blogIds) {
      const numHistories = faker.number.int({ min: 1000, max: 10000 });
      const readingHistories = Array.from({ length: numHistories }, () =>
        createReadingHistory(blogId, faker.helpers.arrayElement(userIds))
      );

      // Insert in chunks to avoid memory issues
      const chunkSize = 1000;
      for (let i = 0; i < readingHistories.length; i += chunkSize) {
        const chunk = readingHistories.slice(i, i + chunkSize);
        await db.insert(schema.readingHistories).values(chunk);
      }
    }

    // Create blog stats in batch
    for (const blogId of blogIds) {
      const blogStatsArr = [];
      let temp = dayjs().subtract(365, 'day');
      for (let i = 0; i < 365; i++) {
        const addedDate = temp.add(1, 'day');
        blogStatsArr.push(generateBlogStats(blogId, addedDate.toDate()));
        temp = addedDate;
      }
      await db.insert(schema.blogStats).values(blogStatsArr);
    }

    // Cleanup
    await client.end();
    console.log('DB seeded with fake data');
  } catch (error) {
    console.error('Seeding error:', error);
    await client.end();
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
