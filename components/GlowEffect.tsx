'use client';

import { useEffect } from 'react';

export function GlowEffect() {
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const card = (e.target as Element)?.closest?.('.glow-card') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return null;
}
