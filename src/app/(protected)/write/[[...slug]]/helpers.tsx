import { DirectiveDescriptor } from '@mdxeditor/editor';
import { LeafDirective } from 'mdast-util-directive';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface YoutubeDirectiveNode extends LeafDirective {
  name: 'youtube';
  attributes: { id: string };
}

export const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> =
  {
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

export const ImagePreviewHandler: React.FC<{
  imageUrl: string;
  width?: number;
  height?: number;
  onDelete?: () => void;
}> = ({ imageUrl, width, height, onDelete }) => {
  const aspectRatio = width && height ? width / height : 16 / 9;

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: '100%',
        margin: '1rem 0',
        '&:hover .delete-button': {
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          height: 'auto',
          aspectRatio: aspectRatio,
          overflow: 'hidden',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#f5f5f5',
          }}
        />
        {onDelete && (
          <IconButton
            className="delete-button"
            onClick={onDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

interface ImageDirectiveNode extends LeafDirective {
  name: 'image';
  attributes: {
    src: string;
    alt?: string;
    width?: string;
    height?: string;
  };
}

export const ImageDirectiveDescriptor: DirectiveDescriptor<ImageDirectiveNode> =
  {
    name: 'image',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'image';
    },
    attributes: ['src', 'alt', 'width', 'height'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      const handleDelete = () => {
        parentEditor.update(() => {
          lexicalNode.selectNext();
          lexicalNode.remove();
        });
      };

      return (
        <ImagePreviewHandler
          imageUrl={mdastNode.attributes.src}
          width={
            mdastNode.attributes.width
              ? parseInt(mdastNode.attributes.width)
              : undefined
          }
          height={
            mdastNode.attributes.height
              ? parseInt(mdastNode.attributes.height)
              : undefined
          }
          onDelete={handleDelete}
        />
      );
    },
  };
