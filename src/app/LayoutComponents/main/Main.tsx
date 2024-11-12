'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store'; // assuming you have the store setup
import DesktopMain from '@/app/LayoutComponents/main/DesktopMain'; // Desktop Content
import MobileMain from '@/app/LayoutComponents/main/MobileMain'; // Mobile Content
import TabletMain from '@/app/LayoutComponents/main/TabletMain'; // Tablet Content

const Main = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Get screenSize from Redux store
  const device = useAppSelector((state: RootState) => state.ui.screenSize);

  // Return different content based on device type
  return (
    <div className="main-content h-full">
      {/* Conditional Rendering of Content */}
      {device === 'Desktop' && <DesktopMain>{children}</DesktopMain>}
      {device === 'Tablet' && <TabletMain>{children}</TabletMain>}
      {device === 'Mobile' && <MobileMain>{children}</MobileMain>}
    </div>
  );
}

export default Main;