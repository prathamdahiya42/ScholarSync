'use client';

import React, { useEffect, useState } from 'react';
import Dither from './Dither';

export default function DitherBackground() {
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const getTheme = () => {
      const html = document.documentElement;
      const dataTheme = html.getAttribute('data-theme');
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme;
      }
      if (html.classList.contains('dark')) return 'dark';
      if (html.classList.contains('light')) return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    setTheme(getTheme());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const html = document.documentElement;
      if (!html.getAttribute('data-theme') && !html.classList.contains('dark') && !html.classList.contains('light')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('resize', checkMobile);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const isDark = theme === 'dark';
  const pixelSize = isMobile ? 3 : 2;
  const dpr = isMobile ? 1.5 : undefined;

  const darkProps = {
    waveColor: '#DC2626',
    backgroundColor: '#0C080B',
    ditherMode: 'bayer',
    colorNum: 4,
    pixelSize,
    waveSpeed: 0.05,
    waveFrequency: 3,
    waveAmplitude: 0.3,
    mouseEffect: 'erase',
    mouseRadius: 0.3,
    dpr,
  };

  const lightProps = {
    waveColor: '#F87171',
    backgroundColor: '#FFFBFB',
    ditherMode: 'bayer',
    colorNum: 4,
    pixelSize,
    waveSpeed: 0.05,
    waveFrequency: 3,
    waveAmplitude: 0.3,
    contrast: 0.85,
    mouseEffect: 'reveal',
    mouseRadius: 0.3,
    dpr,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: isDark ? '#0C080B' : '#FFFBFB',
        transition: 'background-color 0.3s ease',
      }}
      aria-hidden="true"
    >
      {mounted && (
        <Dither
          key={theme}
          {...(isDark ? darkProps : lightProps)}
        />
      )}
    </div>
  );
}
