'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store'; // assuming you have the store setup
import DesktopNav from '@/app/LayoutComponents/header/DesktopNav'; // Desktop Navigation
import MobileNav from '@/app/LayoutComponents/header/MobileNav'; // Mobile Navigation
import TabletNav from '@/app/LayoutComponents/header/TabletNav'; // Tablet Navigation

const Nav = () => {
  // Get screenSize from Redux store
  const device = useAppSelector((state: RootState) => state.ui.screenSize);

  // Return different navigation components based on device type
  return (
    <div className="flex items-center justify-between absolute top-0 w-full">
      {/* Conditional Rendering of Navigation */}
      {device === 'Desktop' && <DesktopNav />}
      {device === 'Tablet' && <TabletNav />}
      {device === 'Mobile' && <MobileNav />}
    </div>
  );
}

export default Nav;