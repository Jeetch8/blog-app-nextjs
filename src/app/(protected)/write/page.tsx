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
  DirectiveDescriptor,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { Box, Button, Container, CircularProgress, Stack } from '@mui/material';
import { LeafDirective } from 'mdast-util-directive';
import { useState, useRef } from 'react';
import { FetchStates, useFetch } from '@/hooks/useFetch';
import Image from 'next/image';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import './style.css';

interface YoutubeDirectiveNode extends LeafDirective {
  name: 'youtube';
  attributes: { id: string };
}

const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> = {
  name: 'youtube',
  type: 'leafDirective',
  testNode(node) {
    return node.name === 'youtube';
  },
  attributes: ['id'],
  hasChildren: false,
  Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <button
          onClick={() => {
            parentEditor.update(() => {
              lexicalNode.selectNext();
              lexicalNode.remove();
            });
          }}
        >
          delete
        </button>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${mdastNode.attributes.id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    );
  },
};

async function expressImageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  const response = await fetch('/uploads/new', {
    method: 'POST',
    body: formData,
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

export default function Editor() {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fetchState, dataRef, errorRef, doFetch } = useFetch<{ url: string }>({
    url: '/uploads/new',
    method: 'POST',
  });

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const formData = new FormData();
      formData.append('image', file);
      await doFetch(formData);
    }
  };

  const handleCoverImageClick = () => {
    fileInputRef.current?.click();
  };

  // Update coverImageUrl when data is received
  if (dataRef.current && dataRef.current.url && !coverImageUrl) {
    setCoverImageUrl(dataRef.current.url);
  }

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ marginBottom: '1rem' }}
      >
        <Button variant="contained" onClick={() => console.log()}>
          Save
        </Button>
        <Button variant="contained">Publish</Button>
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
            disabled={fetchState === FetchStates.LOADING}
            startIcon={
              fetchState === FetchStates.LOADING ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {fetchState === FetchStates.LOADING
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
              <CameraEnhanceIcon />
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
      <MDXEditor
        markdown=""
        className="mdx-editor"
        autoFocus
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
            imageAutocompleteSuggestions: [
              'https://via.placeholder.com/150',
              'https://via.placeholder.com/150',
            ],
            imageUploadHandler: expressImageUploadHandler,
          }),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
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
            ],
          }),
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
          markdownShortcutPlugin(),
        ]}
      />
    </Container>
  );
}
