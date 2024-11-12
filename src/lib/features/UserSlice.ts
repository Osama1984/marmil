import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id:string;
  email: string;
  username: string;
  address: string;
  phoneNumber: string;
  profileImage: File | null | string; // Handle file or URL for profile image
  selectedState: string;
  zipCode: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
  hasToken: boolean;
  isTokenExpired: boolean;
  userType: 'Guest' | 'Authenticated'; // Define user type
}

const initialState: UserState = {
  id:'',
  email: '',
  username: '',
  address: '',
  phoneNumber: '',
  profileImage: null,
  selectedState: '',
  zipCode: '',
  isRegistered: false,
  isLoggedIn: false,
  hasToken: false,
  isTokenExpired: false,
  userType: 'Guest', // Default to 'Guest'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (
      state,
      action: PayloadAction<{
        id:string
        email: string;
        username: string;
        address: string;
        phoneNumber: string;
        profileImage: File | null | string;
        selectedState: string;
        zipCode: string;
      }>
    ) => {
      state.id=action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.address = action.payload.address;
      state.phoneNumber = action.payload.phoneNumber;
      state.profileImage = action.payload.profileImage;
      state.selectedState = action.payload.selectedState;
      state.zipCode = action.payload.zipCode;
      state.isRegistered = true; // Mark as registered
      state.isLoggedIn = false; // User is not logged in after registration
      state.hasToken = false;
      state.isTokenExpired = false;
      state.userType = 'Guest'; // If newly registered, it's a guest
    },

    updateUserProfile: (state, action: PayloadAction<UserState>) => {
      const { username, email, address, phoneNumber, profileImage, selectedState, zipCode } = action.payload;
      
      if (username) state.username = username;
      if (email) state.email = email;
      if (address) state.address = address;
      if (phoneNumber) state.phoneNumber = phoneNumber;
      if (profileImage) state.profileImage = profileImage;
      if (selectedState) state.selectedState = selectedState;
      if (zipCode) state.zipCode = zipCode;
    },

    loginUser: (
      state,
      action: PayloadAction<{
        token: string;
        email: string;
        username: string;
        profileImage: string|File|null; // For logged-in users, profileImage can be a URL string
      }>
    ) => {
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.profileImage = action.payload.profileImage;
      state.isLoggedIn = true;
      state.hasToken = true; // User has a valid token now
      state.isTokenExpired = false;
      state.userType = 'Authenticated'; // Mark user as authenticated
    },

    logoutUser: (state) => {
      state.email = '';
      state.username = '';
      state.address = '';
      state.phoneNumber = '';
      state.profileImage = null;
      state.selectedState = '';
      state.zipCode = '';
      state.isRegistered = false;
      state.isLoggedIn = false;
      state.hasToken = false;
      state.isTokenExpired = false;
      state.userType = 'Guest'; // Log the user out and mark them as a guest
    },

    setTokenExpired: (state) => {
      state.isTokenExpired = true;
      state.hasToken = false;
      state.isLoggedIn = false; // Optional: You might want to logout the user when the token expires
      state.userType = 'Guest'; // After token expiry, set user type to Guest
    },

    clearUserDetails: (state) => {
      state.email = '';
      state.username = '';
      state.address = '';
      state.phoneNumber = '';
      state.profileImage = null;
      state.selectedState = '';
      state.zipCode = '';
      state.isRegistered = false;
      state.isLoggedIn = false;
      state.hasToken = false;
      state.isTokenExpired = false;
      state.userType = 'Guest'; // Clear user details and set user type to Guest
    },
  },
});

export const {
  setUserDetails,
  loginUser,
  logoutUser,
  setTokenExpired,
  clearUserDetails,
  updateUserProfile,
} = userSlice.actions;

export default userSlice.reducer;

