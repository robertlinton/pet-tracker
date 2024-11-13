// app/mobile-not-supported/page.tsx

'use client';

import React from 'react';

export default function MobileNotSupportedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Site Not Available on Mobile Devices
      </h1>
      <p className="text-lg text-center text-muted-foreground">
        This application is not available on mobile devices. Please access it from a desktop or laptop computer.
      </p>
    </div>
  );
}
