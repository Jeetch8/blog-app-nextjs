import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from '@/app/(protected)/write/[[...slug]]/page';
import { makeServer } from './mocks/server';
import { Server } from 'miragejs';
import { useParams } from 'next/navigation';

// Mock components and dependencies
vi.mock('@mdxeditor/editor', () => ({
  MDXEditor: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mdx-editor">{children}</div>
  ),
  headingsPlugin: vi.fn(),
  markdownShortcutPlugin: vi.fn(),
  thematicBreakPlugin: vi.fn(),
  quotePlugin: vi.fn(),
  listsPlugin: vi.fn(),
  toolbarPlugin: vi.fn(),
  linkPlugin: vi.fn(),
  KitchenSinkToolbar: () => <div>Toolbar</div>,
  imagePlugin: vi.fn(),
  frontmatterPlugin: vi.fn(),
  codeBlockPlugin: vi.fn(),
  directivesPlugin: vi.fn(),
  diffSourcePlugin: vi.fn(),
  codeMirrorPlugin: vi.fn(),
  tablePlugin: vi.fn(),
  linkDialogPlugin: vi.fn(),
  directivePlugin: vi.fn().mockReturnValueOnce({
    directiveDescriptors: [
      {
        directiveName: 'youtube',
        directiveComponent: vi.fn(),
      },
    ],
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    slug: [],
  }),
}));

describe('Write Page', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  test('renders all required components', () => {
    render(<Editor params={{ slug: [] }} />);

    // Check for main components
    expect(screen.getByPlaceholderText('Article Title...')).toBeDefined();
    expect(screen.getByTestId('mdx-editor')).toBeDefined();
    expect(screen.getByText('Draft')).toBeDefined();
    expect(screen.getByText('Publish')).toBeDefined();
    expect(screen.getByPlaceholderText('Add tags...')).toBeDefined();
    expect(screen.getByText('Add Cover Image')).toBeDefined();
  });

  test('loads existing blog data when slug is provided', async () => {
    // Create a test blog
    const user = server.create('user');
    const blog = server.create('blog', {
      title: 'Test Blog',
      content: 'Test Content',
      tags: ['test', 'blog'],
      authorId: user.id,
    });

    // Mock useParams to return the blog id
    vi.mocked(useParams).mockReturnValueOnce({ slug: [blog.id] });

    render(<Editor params={{ slug: [blog.id] }} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Blog')).toBeDefined();
      expect(screen.getByText('test')).toBeDefined();
      expect(screen.getByText('blog')).toBeDefined();
    });
  });

  test('can draft a blog', async () => {
    const user = userEvent.setup();
    render(<Editor params={{ slug: [] }} />);

    // Fill in blog details
    await user.type(
      screen.getByPlaceholderText('Article Title...'),
      'Draft Title'
    );

    // Click draft button
    await user.click(screen.getByText('Draft'));

    await waitFor(() => {
      // Verify API call was made with correct data
      const lastRequest =
        server.pretender.handledRequests[
          server.pretender.handledRequests.length - 1
        ];
      const requestBody = JSON.parse(lastRequest.requestBody);
      expect(requestBody.title).toBe('Draft Title');
      expect(requestBody.blog_status).toBe('DRAFT');
    });
  });

  test('can publish a blog', async () => {
    const user = userEvent.setup();
    render(<Editor params={{ slug: [] }} />);

    // Fill in blog details
    await user.type(
      screen.getByPlaceholderText('Article Title...'),
      'Published Title'
    );

    // Click publish button
    await user.click(screen.getByText('Publish'));

    await waitFor(() => {
      const lastRequest =
        server.pretender.handledRequests[
          server.pretender.handledRequests.length - 1
        ];
      const requestBody = JSON.parse(lastRequest.requestBody);
      expect(requestBody.title).toBe('Published Title');
      expect(requestBody.blog_status).toBe('PUBLISHED');
    });
  });

  test('can upload banner image', async () => {
    const user = userEvent.setup();
    render(<Editor params={{ slug: [] }} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('banner-image-input');

    await user.upload(input, file);

    await waitFor(() => {
      // Verify image upload API call
      const uploadRequest = server.pretender.handledRequests.find((req) =>
        req.url.includes('/api/uploads')
      );
      expect(uploadRequest).toBeDefined();
    });
  });

  test('can add and remove tags', async () => {
    const user = userEvent.setup();
    render(<Editor params={{ slug: [] }} />);

    const tagInput = screen.getByPlaceholderText('Add tags...');

    // Add tags
    await user.type(tagInput, 'javascript{enter}');
    await user.type(tagInput, 'react{enter}');

    expect(screen.getByText('javascript')).toBeDefined();
    expect(screen.getByText('react')).toBeDefined();

    // Remove tag
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.queryByText('javascript')).toBeNull();
    expect(screen.getByText('react')).toBeDefined();
  });
});
