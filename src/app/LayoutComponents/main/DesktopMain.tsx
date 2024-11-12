'use client';

import React from 'react';

const DesktopMain = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="desktop-main-content h-full">
     {children}
    </div>
  );
}

export default DesktopMain;
