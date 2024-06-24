'use client';

import { useState } from 'react';
import ReactCopyToClipboard from 'react-copy-to-clipboard';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';

export default function CopyToClipboard({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <ReactCopyToClipboard text={text} onCopy={handleCopy}>
      <IconButton
        color={copied ? 'success' : 'primary'}
        className={`copy-button ${className}`}
        size="small"
        sx={{
          width: 'fit-content',
          fontSize: '0.70rem',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {copied ? <CheckIcon /> : <ContentCopyIcon />}
      </IconButton>
    </ReactCopyToClipboard>
  );
}
