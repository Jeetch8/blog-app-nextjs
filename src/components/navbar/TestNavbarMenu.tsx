'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid2, IconButton, Stack, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { gsap } from 'gsap';
import { User } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const settings = [
  { title: 'Home', path: '/' },
  { title: 'Profile', path: '/profile' },
  { title: 'Write', path: '/write' },
  { title: 'Lists', path: '/lists' },
  { title: 'Stats', path: '/stats' },
  { title: 'Settings', path: '/settings' },
];

const TestNavbarMenu = ({ user }: { user: User | undefined }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement | null>(null);
  const menuIconRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuTl = useMemo(() => {
    if (!menuOverlayRef.current) return;
    const menuItems = menuOverlayRef.current?.querySelectorAll('.menu-item');
    const strikeLines = menuOverlayRef.current?.querySelectorAll(
      '.strike-through:is(.active)'
    );
    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 0.5, ease: 'power4.inOut' },
        onStart: () => {
          setIsOpen(true);
        },
        onReverseComplete: () => {
          setIsOpen(false);
        },
      })
      .to(menuIconRef.current, {
        rotation: isOpen ? 0 : 90,
        scale: 2,
        top: 15,
        right: 30,
        ease: 'power2.inOut',
      })
      .to(
        menuOverlayRef.current,
        {
          display: 'block',
          height: '100vh',
        },
        '-=0.3'
      )
      .from(menuItems, {
        yPercent: 100,
      })
      .to(strikeLines, {
        scaleX: 1,
        transformOrigin: 'left',
        stagger: 0.1,
        duration: 0.4,
        width: '100%',
      });

    return tl;
  }, [menuOverlayRef.current]);

  const handleMenuClick = () => {
    if (!isOpen) {
      menuTl?.play();
    } else {
      menuTl?.reverse();
    }
  };

  // const handleMenuItemClick = (path: string) => {
  //   menuTl?.reverse();
  //   setIsOpen(false);
  //   router.push(path);
  // };

  return (
    <>
      <button
        style={{
          position: 'fixed',
          top: 10,
          right: 30,
          zIndex: 10,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'none',
          padding: '7px 0',
        }}
        ref={menuIconRef}
        onClick={handleMenuClick}
        className="menu-icon"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <Box
        ref={menuOverlayRef}
        className="menu-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          display: 'none',
          right: 0,
          height: '0',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: '#212222',
          padding: 2,
        }}
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
          gap={3}
        >
          {settings.map((setting) => {
            const isActive = pathname === setting.path;

            return (
              <Box
                key={setting.title}
                className="mask"
                sx={{
                  fontWeight: 900,
                  overflow: 'hidden',
                  height: 'fit',
                  width: 'fit',
                  position: 'relative',
                }}
              >
                <Typography
                  component={Link}
                  href={setting.path}
                  className="menu-item"
                  fontWeight={900}
                  variant="h3"
                  textTransform="uppercase"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {setting.title}
                </Typography>
                <Box
                  className={`strike-through ${isActive ? 'active' : ''}`}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    width: '0',
                    height: '6px',
                    backgroundColor: 'rgb(255, 255, 255)',
                    transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})`,
                    transformOrigin: 'left',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>
    </>
  );
};

export default TestNavbarMenu;
