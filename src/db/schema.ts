import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  pgEnum,
  index,
  vector,
  uniqueIndex,
  date,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const blogStatusEnum = pgEnum('blog_status', ['PUBLISHED', 'DRAFT']);

// Tables
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    username: text('username').unique(),
    email: text('email').unique(),
    password: text('password'),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('email_idx').on(sql`lower(${table.email})`),
      usernameIdx: uniqueIndex('username_idx').on(
        sql`lower(${table.username})`
      ),
    };
  }
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  bookmarkCategories: many(bookmarkCategories),
  likes: many(blogLikes),
  comments: many(blogComments),
  readingHistories: many(readingHistories),
  blogsAuthored: many(blogs),
  feedHistory: many(feedHistory),
}));

export const profiles = pgTable('profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: uuid('user_id')
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  tagline: text('tagline'),
  location: text('location'),
  followersCount: integer('followers_count').default(0).notNull(),
  followingCount: integer('following_count').default(0).notNull(),
  websiteUrl: text('website_url'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  twitterUrl: text('twitter_url'),
  availableFor: text('available_for'),
  techStack: text('tech_stack'),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const accounts = pgTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type'),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    tokenType: text('token_type'),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerIdx: uniqueIndex('provider_account_idx').on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').unique().notNull(),
  accessToken: text('access_token'),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationRequests = pgTable(
  'verification_requests',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    identifier: text('identifier').notNull(),
    token: text('token').unique().notNull(),
    expires: timestamp('expires').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenIdentifierIdx: uniqueIndex('token_identifier_idx').on(
      table.identifier,
      table.token
    ),
  })
);

export const blogTopics = pgTable('blog_topics', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const blogTopicsRelations = relations(blogTopics, ({ many }) => ({
  blogs: many(blogs),
}));

export const blogs = pgTable(
  'blogs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    markdownFileUrl: text('markdown_file_url').notNull(),
    markdownFileName: text('markdown_file_name').notNull(),
    blogStatus: blogStatusEnum('blog_status').notNull(),
    shortDescription: text('short_description').notNull(),
    numberOfViews: integer('number_of_views').default(0).notNull(),
    numberOfLikes: integer('number_of_likes').default(0).notNull(),
    numberOfComments: integer('number_of_comments').default(0).notNull(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    embeddings: vector('embeddings', { dimensions: 1536 }),
    readingTime: integer('reading_time').default(0).notNull(),
    topicId: text('topic_id')
      .notNull()
      .references(() => blogTopics.id),
    bannerImg: text('banner_img').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    embeddingIdx: index('embedding_idx').using(
      'hnsw',
      table.embeddings.op('vector_cosine_ops')
    ),
  })
);

export const blogEmbeddingsIndex = sql`
  CREATE INDEX IF NOT EXISTS blog_embeddings_idx 
  ON blogs 
  USING ivfflat (embeddings vector_cosine_ops)
  WITH (lists = 100);
`;

export const bookmarkCategories = pgTable('bookmark_categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const bookmarkCategoriesRelations = relations(
  bookmarkCategories,
  ({ one, many }) => ({
    user: one(users, {
      fields: [bookmarkCategories.userId],
      references: [users.id],
    }),
    categoryBlogs: many(bookmarkCategoryBlogs),
  })
);

export const bookmarkCategoryBlogs = pgTable('bookmark_category_blogs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  bookmarkedByUserId: uuid('bookmarked_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => bookmarkCategories.id, { onDelete: 'cascade' }),
  note: text('note'),
  blogId: text('blog_id')
    .notNull()
    .references(() => blogs.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const bookmarkCategoryBlogsRelations = relations(
  bookmarkCategoryBlogs,
  ({ one }) => ({
    category: one(bookmarkCategories, {
      fields: [bookmarkCategoryBlogs.categoryId],
      references: [bookmarkCategories.id],
    }),
    blog: one(blogs, {
      fields: [bookmarkCategoryBlogs.blogId],
      references: [blogs.id],
    }),
    bookmarkedByUser: one(users, {
      fields: [bookmarkCategoryBlogs.bookmarkedByUserId],
      references: [users.id],
    }),
  })
);

export const blogLikes = pgTable(
  'blog_likes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    blogId: text('blog_id')
      .notNull()
      .references(() => blogs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userBlogIdx: index('user_blog_idx').on(table.userId, table.blogId),
  })
);

export const blogLikesRelations = relations(blogLikes, ({ one }) => ({
  blogThatsLiked: one(blogs, {
    fields: [blogLikes.blogId],
    references: [blogs.id],
  }),
  userThatLiked: one(users, {
    fields: [blogLikes.userId],
    references: [users.id],
  }),
}));

export const blogComments = pgTable(
  'blog_comments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    content: text('content').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    blogId: text('blog_id')
      .notNull()
      .references(() => blogs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userBlogIdx: index('user_blog_comment_idx').on(table.userId, table.blogId),
  })
);

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
}));

export const readingHistories = pgTable(
  'reading_histories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid('user_id').references(() => users.id),
    blogId: text('blog_id')
      .notNull()
      .references(() => blogs.id),
    referrer: text('referrer'),
    browser: text('browser'),
    os: text('os'),
    device: text('device'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    blogIdx: index('blog_idx').on(table.blogId),
  })
);

export const readingHistoriesRelations = relations(
  readingHistories,
  ({ one }) => ({
    blog: one(blogs, {
      fields: [readingHistories.blogId],
      references: [blogs.id],
    }),
    user: one(users, {
      fields: [readingHistories.userId],
      references: [users.id],
    }),
  })
);

export const blogStats = pgTable(
  'blog_stats',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    blogId: text('blog_id')
      .notNull()
      .references(() => blogs.id),
    numberOfViews: integer('number_of_views').default(0).notNull(),
    numberOfLikes: integer('number_of_likes').default(0).notNull(),
    numberOfComments: integer('number_of_comments').default(0).notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    blogCreatedAtIdx: index('blog_created_at_idx').on(
      table.blogId,
      table.createdAt
    ),
  })
);

export const blogStatsRelations = relations(blogStats, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogStats.blogId],
    references: [blogs.id],
  }),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
  topic: one(blogTopics, {
    fields: [blogs.topicId],
    references: [blogTopics.id],
  }),
  comments: many(blogComments),
  likes: many(blogLikes),
  readingHistories: many(readingHistories),
  categoryBlogs: many(bookmarkCategoryBlogs),
  stats: many(blogStats),
  feedHistory: many(feedHistory),
}));

// Add the new feedHistory table
export const feedHistory = pgTable(
  'feed_history',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blogId: text('blog_id')
      .notNull()
      .references(() => blogs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Add an index for faster queries on user's feed history
    userBlogIdx: index('feed_history_user_blog_idx').on(
      table.userId,
      table.blogId
    ),
  })
);

// Add relations for feedHistory
export const feedHistoryRelations = relations(feedHistory, ({ one }) => ({
  user: one(users, {
    fields: [feedHistory.userId],
    references: [users.id],
  }),
  blog: one(blogs, {
    fields: [feedHistory.blogId],
    references: [blogs.id],
  }),
}));
