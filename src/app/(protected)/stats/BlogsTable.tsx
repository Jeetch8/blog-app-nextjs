import { Blog } from '@prisma/client';
import Link from 'next/link';
import React, { memo } from 'react';

const BlogsTable = memo(({ data }: { data: Partial<Blog>[] }) => {
  return (
    <table
      style={{
        width: '100%',
        background: 'transparent',
      }}
      cellSpacing={10}
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Blogs</th>
          <th>Views</th>
          <th>Likes</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} style={{ textAlign: 'center' }}>
            <td style={{ textAlign: 'left', padding: 8 }}>
              <Link
                style={{ textDecoration: 'none', color: 'inherit' }}
                href={`/stats/blog/${row.id}`}
              >
                {row.title || ''}
              </Link>
            </td>
            <td>{row?.number_of_views || 0}</td>
            <td>{row?.number_of_likes || 0}</td>
            <td>{row?.number_of_comments || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default BlogsTable;
