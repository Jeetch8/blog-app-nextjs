import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '@/app/(protected)/home/page';
import { makeServer } from './mocks/server';
import { Server } from 'miragejs';

// Mock components and dependencies
vi.mock('next/font/google', () => ({
  Caveat: () => ({
    style: { fontFamily: 'mocked-caveat' },
  }),
}));

vi.mock('@studio-freight/lenis', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@studio-freight/react-lenis', () => ({
  ReactLenis: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lenis-mock">{children}</div>
  ),
}));

vi.mock('react-spinners', () => ({
  HashLoader: () => <div data-testid="spinner-mock" key={0} />,
}));

vi.mock('react-infinite-scroller', () => ({
  default: ({ children, loadMore, hasMore, loader }: any) => {
    let toReturn = loader;
    setTimeout(() => {
      loadMore(1);
      toReturn = children;
    }, 1);
    return toReturn;
  },
}));

const renderComponent = () => render(<Home />);

describe('Home Component', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'development' });
    vi.useFakeTimers();
  });

  afterEach(() => {
    server.shutdown();
    vi.useRealTimers();
  });

  it('should show loader initially', () => {
    renderComponent();
    const loader = screen.getByTestId('spinner-mock');
    expect(loader).toBeDefined();
  });

  it('should load blog cards', async () => {
    const comp = renderComponent();
    const loader = screen.getByTestId('spinner-mock');
    vi.advanceTimersByTime(100);
    await waitFor(() => {
      // expect(loader).not.toBeInTheDocument();
      const blogCards = screen.getAllByTestId('blog-card');
      // expect(blogCards).toHaveLength(3);
    });
  });

  // test('should throw error if API fails', async () => {
  //   // Mock API error
  //   server.get('/api/home', () => {
  //     return new Response(null, { status: 500 });
  //   });

  //   render(<Home />);

  //   // Wait for error container to appear
  //   await waitFor(() => {
  //     const errorContainer = screen.getByText('Something went wrong');
  //     expect(errorContainer).toBeDefined();
  //   });
  // });

  // test('should show message if no blogs found', async () => {
  //   // Don't create any blogs in the mock server
  //   render(<Home />);

  //   // Wait for no posts message to appear
  //   await waitFor(() => {
  //     const noPostsMessage = screen.getByText('No posts to show');
  //     expect(noPostsMessage).toBeDefined();
  //   });
  // });

  // test('loads new blogs when scrolled to bottom', async () => {
  //   // Create initial blogs
  //   const user = server.create('user');
  //   Array.from({ length: 5 }).forEach(() => {
  //     server.create('blog', {
  //       authorId: user.id,
  //       blogStatus: 'PUBLISHED',
  //     });
  //   });

  //   render(<Home />);

  //   // Wait for initial blogs to load
  //   await waitFor(() => {
  //     const initialBlogCards = screen.getAllByTestId('blog-card');
  //     expect(initialBlogCards).toHaveLength(5);
  //   });

  //   // Create more blogs for next page
  //   Array.from({ length: 5 }).forEach(() => {
  //     server.create('blog', {
  //       authorId: user.id,
  //       blogStatus: 'PUBLISHED',
  //     });
  //   });

  //   // Trigger infinite scroll load more
  //   const infiniteScroll = screen.getByTestId('infinite-scroll-mock');
  //   fireEvent.click(infiniteScroll);

  //   // Wait for new blogs to be added
  //   await waitFor(() => {
  //     const updatedBlogCards = screen.getAllByTestId('blog-card');
  //     expect(updatedBlogCards.length).toBeGreaterThan(5);
  //   });
  // });
});
