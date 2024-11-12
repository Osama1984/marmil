'use client';

import React from 'react';

const TabletMain = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="tablet-main-content h-full">
      {children}
    </div>
  );
}

export default TabletMain;
