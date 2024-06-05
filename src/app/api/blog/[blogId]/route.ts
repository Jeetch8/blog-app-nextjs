import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export async function GET(
  req: NextApiRequest,
  { params }: { params: { blogId: string } }
) {
  // const blogId = req.nextUrl.pathname.split('/')[3];
  console.log(params.blogId);
  // return NextResponse.json({ message: 'Hello, world!' });
  return NextResponse.json({ message: 'Hello, world!', blogId: params.blogId });
}
