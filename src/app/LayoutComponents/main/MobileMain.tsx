'use client';

import React from 'react';

const MobileMain = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
     {children}
    </div>
  );
}

export default MobileMain;
