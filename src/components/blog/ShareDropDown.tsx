'use client';

import { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  RedditIcon,
} from 'react-share';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import { ShareOutlined, Link as LinkIcon } from '@mui/icons-material';

interface ShareDropDownProps {
  url: string;
  title: string;
}

export default function ShareDropDown({ url, title }: ShareDropDownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    handleClose();
  };

  const iconSize = 32;

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-controls={open ? 'share-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <ShareOutlined />
      </IconButton>
      <Menu
        id="share-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: '200px',
            },
          },
        }}
      >
        <MenuItem onClick={copyToClipboard} sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} width="100%">
            <LinkIcon />
            <ListItemText>Copy permalink</ListItemText>
          </Stack>
        </MenuItem>
        <Divider />

        <MenuItem sx={{ width: '100%' }}>
          <FacebookShareButton url={url}>
            <Stack direction="row" alignItems="center" width="100%" spacing={1}>
              <FacebookIcon size={iconSize} round />
              <ListItemText>Facebook</ListItemText>
            </Stack>
          </FacebookShareButton>
        </MenuItem>
        <Divider />

        <MenuItem sx={{ width: '100%' }}>
          <TwitterShareButton url={url} title={title}>
            <Stack direction="row" alignItems="center" spacing={1} width="100%">
              <TwitterIcon size={iconSize} round />
              <ListItemText>Twitter</ListItemText>
            </Stack>
          </TwitterShareButton>
        </MenuItem>
        <Divider />

        <MenuItem sx={{ width: '100%' }}>
          <LinkedinShareButton url={url} title={title}>
            <Stack direction="row" alignItems="center" spacing={1} width="100%">
              <LinkedinIcon size={iconSize} round />
              <ListItemText>LinkedIn</ListItemText>
            </Stack>
          </LinkedinShareButton>
        </MenuItem>
        <Divider />

        <MenuItem sx={{ width: '100%' }}>
          <WhatsappShareButton url={url} title={title}>
            <Stack direction="row" alignItems="center" spacing={1} width="100%">
              <WhatsappIcon size={iconSize} round />
              <ListItemText>WhatsApp</ListItemText>
            </Stack>
          </WhatsappShareButton>
        </MenuItem>
        <Divider />

        <MenuItem sx={{ width: '100%' }}>
          <RedditShareButton url={url} title={title}>
            <Stack direction="row" alignItems="center" spacing={1} width="100%">
              <RedditIcon size={iconSize} round />
              <ListItemText>Reddit</ListItemText>
            </Stack>
          </RedditShareButton>
        </MenuItem>
      </Menu>
    </>
  );
}
