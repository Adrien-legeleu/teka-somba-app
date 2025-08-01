'use client';

import React from 'react';

export default function Loader() {
  return (
    <div className="h-[50vh] flex items-center justify-center">
      <div className="grid-loader">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="cube" />
        ))}
      </div>
    </div>
  );
}
