import './styles.css';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import prisma from '@prisma_client/prisma';
import {
  Container,
  Typography,
  Box,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import Image from 'next/image';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';
import { getFileFromS3 } from '@/utils/s3';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import jsx from 'highlight.js/lib/languages/xml';
import tsx from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import rehypeHighlight from 'rehype-highlight';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import CopyToClipboard from '@/components/CopyToClipboard';
import rehypeToc from 'rehype-toc';
import Link from 'next/link';
import BlogLikesDrawer from '@/components/blog/BlogLikesDrawer';
import BlogCommentsDrawer from '@/components/blog/CommentsDrawer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getBlogById } from '@/db_access/blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AddToBookmarkSelect from '@/components/blog/AddToBookmarkSelect';
import ShareDropDown from '@/components/blog/ShareDropDown';

dayjs.extend(relativeTime);

interface BlogPageProps {
  params: {
    blogId: string;
  };
}

// Initialize lowlight with supported languages
const lowlight = createLowlight();
lowlight.register('js', js);
lowlight.register('javascript', js);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('jsx', jsx);
lowlight.register('tsx', tsx);
lowlight.register('bash', bash);
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await prisma.blog.findUnique({
    where: { id: params.blogId },
    include: { user: true },
  });

  if (!blog) return { title: 'Blog not found' };

  return {
    title: blog.title,
    description: blog.short_description,
    authors: [{ name: blog.user.name }],
  };
}

export async function generateStaticParams() {
  const blogs = await prisma.blog.findMany({
    select: { id: true },
  });

  return blogs.map((blog) => ({
    blogId: blog.id,
  }));
}

export default async function BlogPage({ params }: BlogPageProps) {
  const session = await getServerSession(authOptions);
  const blog = await getBlogById(params.blogId, session?.user?.id!);

  if (!blog) notFound();

  const markdownContent = await getFileFromS3(
    process.env.AWS_BUCKET_NAME!,
    'blogs/seed/' + blog.markdown_file_name
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}/blog/${params.blogId}`;

  return (
    <Container component="article" sx={{ color: 'text.primary' }}>
      <Box sx={{ mb: 4, position: 'relative', maxWidth: 1150, height: 550 }}>
        <Image
          src={blog.banner_img}
          alt={blog.title}
          fill
          style={{ borderRadius: '10px' }}
        />
      </Box>

      <Typography
        variant="h3"
        sx={{ fontSize: '2.6rem' }}
        textAlign="center"
        fontWeight={700}
        gutterBottom
      >
        {blog.title}
      </Typography>

      <Stack
        sx={{ mt: 4, mb: 8, color: 'grey' }}
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <Avatar sx={{ width: 46, height: 46 }} src={blog.user.image || ''} />
        <Typography variant="subtitle1">
          <Typography
            component={Link}
            href={`/profile/${blog.user.username}`}
            style={{ fontWeight: 700, color: 'white', textDecoration: 'none' }}
          >
            {blog.user.username?.toLowerCase()}
          </Typography>{' '}
          · {new Date(blog.createdAt).toLocaleDateString()}{' '}
          <Typography component={'span'}>
            · {blog.reading_time} min read
          </Typography>
        </Typography>
      </Stack>

      <Box className="prose prose-invert max-w-none">
        <MDXRemote
          source={markdownContent}
          components={{
            a: (props) => {
              const isHeading = props?.href?.startsWith('#');
              return (
                <a
                  {...props}
                  style={{
                    color: 'white',
                    textDecoration: 'underline',
                    ...(isHeading && { textDecoration: 'none' }),
                  }}
                >
                  {props.children}
                </a>
              );
            },
            pre: (props) => {
              return <pre className="mdx-pre">{props.children}</pre>;
            },
            code: (props) => {
              const language =
                props.className?.replace('language-', '') || 'text';
              return (
                <code className={`language-${language} mdx-code`}>
                  {props.className && (
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={1}
                    >
                      <CopyToClipboard text={JSON.stringify(props.children)} />
                    </Stack>
                  )}
                  {props.children}
                </code>
              );
            },
          }}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [rehypePrism, { ignoreMissing: true }],
                [rehypeSlug],
                [
                  rehypeHighlight,
                  {
                    languages: { js, typescript, jsx, tsx, bash },
                  },
                ],
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                [rehypeToc, { nav: true }],
              ],
              format: 'md',
            },
          }}
        />
      </Box>
      <Stack direction={'row'} justifyContent={'center'} sx={{ my: 5 }}>
        <Stack
          sx={{
            border: '1px solid gray',
            borderRadius: 50,
            paddingX: 5,
            paddingY: 2,
          }}
          spacing={2}
          direction={'row'}
          alignItems={'center'}
        >
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <BlogLikesDrawer
              numberOfLikes={blog.number_of_likes}
              hasUserLikedBlog={blog.hasUserLikedBlog}
            />
          </Stack>
          <Divider orientation="vertical" />
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <BlogCommentsDrawer
              totalComments={blog.number_of_comments}
              hasUserCommentedBlog={blog.hasUserCommentedBlog}
            />
          </Stack>
          <Divider orientation="vertical" />
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <AddToBookmarkSelect
              blogId={blog.id}
              isBookmarked={blog.hasUserBookmarkedBlog}
            />
          </Stack>
          <Divider orientation="vertical" />
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <ShareDropDown url={fullUrl} title={blog.title} />
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
