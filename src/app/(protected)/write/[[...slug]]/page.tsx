'use client';

import {
  MDXEditor,
  headingsPlugin,
  markdownShortcutPlugin,
  thematicBreakPlugin,
  quotePlugin,
  listsPlugin,
  toolbarPlugin,
  linkPlugin,
  KitchenSinkToolbar,
  imagePlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  diffSourcePlugin,
  codeMirrorPlugin,
  tablePlugin,
  linkDialogPlugin,
  MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Stack,
  Autocomplete,
  Chip,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FetchStates, useFetch } from '@/hooks/useFetch';
import Image from 'next/image';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import './style.css';
import { blogs } from '@/db/schema';
import {
  YoutubeDirectiveDescriptor,
  ImageDirectiveDescriptor,
} from './helpers';
import { toast } from 'react-hot-toast';
import { HashLoader } from 'react-spinners';

async function imageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

export default function Editor({ params }: { params: { slug: string[] } }) {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MDXEditorMethods>(null);
  const [tags, setTags] = useState<string[]>([]);

  const {
    doFetch: fetchBlogForEdit,
    dataRef: fetchedBlogData,
    fetchState: fetchBlogForEditFetchState,
  } = useFetch<typeof blogs.$inferSelect>({
    url: '/api/blog',
    method: 'GET',
    onSuccess: (data) => {
      console.log(data);
      setTitle(data.title);
      setCoverImageUrl(data.bannerImg);
      editorRef.current?.setMarkdown(data.content);
      const tempTags = data.tags.map((tag) => tag.trim());
      setTags(tempTags);
    },
  });

  useEffect(() => {
    if (params?.slug?.length > 0) {
      fetchBlogForEdit(undefined, `/api/blog/${params?.slug[0]}`);
    }
  }, [params]);

  const { fetchState: imageUploadFetchState, doFetch: uploadImage } = useFetch<{
    url: string;
  }>({
    url: '/api/uploads',
    method: 'POST',
    onSuccess: (data) => {
      console.log(data);
      setCoverImageUrl(data.url);
    },
    onError: (error) => {
      toast.error(error.message as string);
    },
  });

  const { doFetch: uploadBlog, fetchState: uploadBlogFetchState } = useFetch({
    url: '/api/blog',
    method: 'POST',
  });

  const handleCoverImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setCoverImage(file);
        const formData = new FormData();
        formData.append('image', file);
        await uploadImage(formData);
      }
    },
    [uploadImage]
  );

  const handleCreateNewBlog = (blogStatus: 'PUBLISHED' | 'DRAFT') => {
    uploadBlog({
      title,
      banner_img: coverImageUrl,
      blog_status: blogStatus,
      markdown_content: editorRef.current?.getMarkdown(),
      tags,
    });
  };

  const handleCoverImageClick = () => {
    fileInputRef.current?.click();
  };

  if (fetchBlogForEditFetchState === FetchStates.LOADING) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">Loading blog...</Typography>
          <HashLoader />
        </Stack>
      </Box>
    );
  }

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ marginBottom: '1rem' }}
      >
        <Button
          disabled={uploadBlogFetchState === FetchStates.LOADING}
          variant="contained"
          onClick={() => handleCreateNewBlog('DRAFT')}
        >
          Draft
        </Button>
        <Button
          disabled={uploadBlogFetchState === FetchStates.LOADING}
          variant="contained"
          onClick={() => handleCreateNewBlog('PUBLISHED')}
        >
          Publish
        </Button>
      </Stack>

      <Box sx={{ marginBottom: '1rem', position: 'relative' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        {!coverImageUrl && (
          <Button
            variant="outlined"
            onClick={handleCoverImageClick}
            disabled={imageUploadFetchState === FetchStates.LOADING}
            startIcon={
              imageUploadFetchState === FetchStates.LOADING ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {imageUploadFetchState === FetchStates.LOADING
              ? 'Uploading...'
              : 'Add Cover Image'}
          </Button>
        )}
        {coverImageUrl && (
          <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
            <Image
              src={coverImageUrl}
              alt="Cover"
              layout="fill"
              objectFit="cover"
            />
            <Button
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
              onClick={handleCoverImageClick}
            >
              {imageUploadFetchState === FetchStates.LOADING ? (
                <CircularProgress size={20} />
              ) : (
                <CameraEnhanceIcon />
              )}
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ marginY: '1rem' }}>
        <input
          type="text"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            boxShadow: 'none',
            border: 'none',
            fontSize: '2rem',
            outline: 'none',
            width: '100%',
          }}
        />
      </Box>
      <Box sx={{ marginY: '1rem' }}>
        <Autocomplete
          multiple
          freeSolo
          limitTags={10}
          options={[]}
          value={tags}
          onChange={(event, newValue) => {
            const validTags = newValue
              .map((tag) => (typeof tag === 'string' ? tag.trim() : tag))
              .filter((tag) => tag !== '');
            setTags(validTags);
          }}
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Add tags..."
              helperText="Press enter to add tags"
              fullWidth
            />
          )}
          sx={{
            '& .MuiOutlinedInput-root': {
              padding: '8px',
              '& .MuiAutocomplete-endAdornment': {
                top: '50%',
                transform: 'translateY(-50%)',
              },
            },
          }}
        />
      </Box>
      <MDXEditor
        markdown=""
        className="mdx-editor"
        autoFocus
        ref={editorRef}
        contentEditableClassName="mdx-editor-content-editable"
        trim={true}
        placeholder="Write your article here..."
        plugins={[
          toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
          listsPlugin(),
          quotePlugin(),
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: imageUploadHandler,
          }),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          // sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              css: 'CSS',
              txt: 'Plain Text',
              tsx: 'TypeScript',
              '': 'Unspecified',
            },
          }),
          directivesPlugin({
            directiveDescriptors: [
              YoutubeDirectiveDescriptor,
              AdmonitionDirectiveDescriptor,
              ImageDirectiveDescriptor,
            ],
          }),
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
          markdownShortcutPlugin(),
        ]}
      />
    </Container>
  );
}
