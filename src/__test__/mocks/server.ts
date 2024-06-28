import { createServer, Factory, Model, Response } from 'miragejs';
import { faker } from '@faker-js/faker';

export function makeServer({ environment = 'test' } = {}) {
  return createServer({
    environment,

    models: {
      user: Model,
      profile: Model,
      account: Model,
      session: Model,
      verificationRequest: Model,
      blog: Model,
      bookmarkCategory: Model,
      bookmarkCategoryBlog: Model,
      blogLike: Model,
      blogComment: Model,
      readingHistory: Model,
      blogStat: Model,
      feedHistory: Model,
    },

    factories: {
      user: Factory.extend({
        name() {
          return faker.person.fullName();
        },
        username() {
          return faker.internet.username();
        },
        email() {
          return faker.internet.email();
        },
        password() {
          return faker.internet.password();
        },
        emailVerified() {
          return faker.date.past();
        },
        image() {
          return faker.image.avatar();
        },
        createdAt() {
          return faker.date.past();
        },
        updatedAt() {
          return faker.date.recent();
        },
      }),

      profile: Factory.extend({
        bio() {
          return faker.lorem.paragraph();
        },
        userId() {
          return faker.string.uuid();
        },
        tagline() {
          return faker.lorem.sentence();
        },
        location() {
          return faker.location.city();
        },
        followersCount() {
          return faker.number.int({ min: 0, max: 1000 });
        },
        followingCount() {
          return faker.number.int({ min: 0, max: 1000 });
        },
        websiteUrl() {
          return faker.internet.url();
        },
        githubUrl() {
          return `https://github.com/${faker.internet.username()}`;
        },
        linkedinUrl() {
          return `https://linkedin.com/in/${faker.internet.username()}`;
        },
        twitterUrl() {
          return `https://twitter.com/${faker.internet.username()}`;
        },
        availableFor() {
          return faker.helpers.arrayElement([
            'Freelance',
            'Full-time',
            'Part-time',
          ]);
        },
        techStack() {
          return faker.helpers
            .arrayElements(
              ['React', 'Node.js', 'TypeScript', 'Python', 'Java'],
              3
            )
            .join(',');
        },
      }),

      blog: Factory.extend({
        title() {
          return faker.lorem.sentence();
        },
        content() {
          return faker.lorem.paragraphs(5);
        },
        blogStatus() {
          return faker.helpers.arrayElement(['PUBLISHED', 'DRAFT']);
        },
        shortDescription() {
          return faker.lorem.paragraph();
        },
        numberOfViews() {
          return faker.number.int({ min: 0, max: 10000 });
        },
        numberOfLikes() {
          return faker.number.int({ min: 0, max: 1000 });
        },
        numberOfComments() {
          return faker.number.int({ min: 0, max: 100 });
        },

        authorId() {
          return faker.string.uuid();
        },
        readingTime() {
          return faker.number.int({ min: 1, max: 30 });
        },
        bannerImg() {
          return faker.image.url();
        },
        tags() {
          return faker.helpers.arrayElements(
            ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Web Development'],
            3
          );
        },
      }),

      blogComment: Factory.extend({
        content() {
          return faker.lorem.paragraph();
        },
        userId() {
          return faker.string.uuid();
        },
        blogId() {
          return faker.string.uuid();
        },
      }),

      blogLike: Factory.extend({
        userId() {
          return faker.string.uuid();
        },
        blogId() {
          return faker.string.uuid();
        },
      }),

      bookmarkCategory: Factory.extend({
        title() {
          return faker.lorem.words(2);
        },
        description() {
          return faker.lorem.sentence();
        },
        userId() {
          return faker.string.uuid();
        },
      }),

      readingHistory: Factory.extend({
        referrer() {
          return faker.internet.url();
        },
        browser() {
          return faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari']);
        },
        os() {
          return faker.helpers.arrayElement(['Windows', 'MacOS', 'Linux']);
        },
        device() {
          return faker.helpers.arrayElement(['Desktop', 'Mobile', 'Tablet']);
        },
        ipAddress() {
          return faker.internet.ip();
        },
      }),

      blogStat: Factory.extend({
        numberOfViews() {
          return faker.number.int({ min: 0, max: 10000 });
        },
        blogId() {
          return faker.string.uuid();
        },
        numberOfLikes() {
          return faker.number.int({ min: 0, max: 1000 });
        },
        numberOfComments() {
          return faker.number.int({ min: 0, max: 100 });
        },
      }),

      feedHistory: Factory.extend({
        // timestamps only
      }),
    },

    seeds(server) {
      // Create some initial data for development
      const user = server.create('user');
      server.create('profile', { userId: user.id });
      // server.create("profile", {user})

      // Create some blogs for the user
      Array.from({ length: 5 }).forEach(() => {
        const blog = server.create('blog', { authorId: user.id });

        // Create some comments and likes for each blog
        Array.from({ length: 3 }).forEach(() => {
          server.create('blogComment', { blogId: blog.id, userId: user.id });
          server.create('blogLike', { blogId: blog.id, userId: user.id });
        });

        // Create blog stats
        server.create('blogStat', { blogId: blog.id });
      });

      // Create some bookmark categories
      Array.from({ length: 3 }).forEach(() => {
        server.create('bookmarkCategory', { userId: user.id });
      });
    },

    routes() {
      this.urlPrefix = 'http://localhost:3000';
      this.namespace = 'api';

      this.get('/users/:id', (schema, request) => {
        return schema.db.users.find(request.params.id);
      });

      this.get('/home', (schema, request) => {
        return {
          blogs: schema.db.blogs,
          nextCursor: 1,
          prevCursor: 1,
          hasMore: true,
        };
      });

      this.get('/profile/:username', (schema, request) => {
        return {
          users: schema.db.users[0],
          profile: schema.db.profiles[0],
        };
      });

      this.passthrough();
    },
  });
}
