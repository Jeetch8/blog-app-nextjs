import MuiMarkdown from 'mui-markdown';

// make this a server rendered page
const getBlog = async (blogId: string) => {
  const res = await fetch(`/api/blog/${blogId}`);
  const json = await res.json();
  return json;
};

export default async function BlogPage() {
  return <MuiMarkdown>Hello, world!</MuiMarkdown>;
}
