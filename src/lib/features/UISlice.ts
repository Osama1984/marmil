import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deviceType, isDesktop, isMobile, isTablet } from 'react-device-detect';

// Define the initial state
interface UIState {
  screenSize: string;
  width: number;
  height: number;
  isMobileMenuOpen:boolean;
  currentPath:string;
}

// Initialize the initial state with a default device type
const initialState: UIState = {
  screenSize: isTablet
    ? 'Tablet'
    : isMobile
      ? 'Mobile'
      : isDesktop
        ? 'Desktop'
        : 'Desktop', // Default to 'Desktop' if no match
  width: 0,
  height: 0,
  isMobileMenuOpen:false,
  currentPath:''
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Resize action to update screen size and dimensions
    setCurrentPath(state, action: PayloadAction<string>) {
      state.currentPath = action.payload;
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },
    openMobileMenu(state) {
      state.isMobileMenuOpen = true;
    },
    resize(state, action: PayloadAction<{ width: number; height: number }>) {
      const { width, height } = action.payload;

      // Determine device type based on width
      let deviceType = '';
      if (width < 640) {
        deviceType = 'Mobile';
      } else if (width < 1024) {
        deviceType = 'Tablet';
      } else {
        deviceType = 'Desktop';
      }

      // Updating state properties (Immer will handle immutability)
      state.screenSize = deviceType;
      state.width = width;
      state.height = height;
    }
  }
})

// Export the resize action and reducer
export const { resize, setCurrentPath, closeMobileMenu, openMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;