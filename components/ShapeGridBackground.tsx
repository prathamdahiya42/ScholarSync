'use client';

import React, { useEffect, useState } from 'react';
import ShapeGrid from '@/components/ShapeGrid';

export function ShapeGridBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full overflow-hidden"
      aria-hidden="true"
    >
      {mounted && (
        <ShapeGrid
          shape="square"
          direction="diagonal"
          lineColor="#E5E5E5"
          hoverColor="#E60023"
          hoverFillColor="#E60023"
          fillOpacity={0.12}
          speed={0.5}
          rainbow={false}
          glow={0.4}
          twinkle={0}
          backgroundColor="#FFFFFF"
          intro={true}
          clickCascade={true}
          fade={0}
          className="w-full h-full"
        />
      )}
    </div>
  );
}

export default ShapeGridBackground;
