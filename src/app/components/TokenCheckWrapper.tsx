'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { setUserDetails, setTokenExpired, loginUser, logoutUser } from '@/lib/features/UserSlice';
import { UserDetails } from '@/app/types/UserDetails';

const TokenCheckWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Decode the JWT token to get the payload
        const decoded: UserDetails = jwt_decode(token);
        console.log(decoded);
        const { id, email, username, address, phoneNumber, profileImage, selectedState, zipCode, exp } = decoded;
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        // Check if the token has expired
        if (exp > currentTime) {
          // If the token is valid, update the Redux state with user details
          dispatch(
            setUserDetails({
              id,
              email,
              username,
              address,
              phoneNumber,
              profileImage,
              selectedState,
              zipCode,
            })
          );
          // Mark the user as authenticated
          dispatch(loginUser({ token, email, username, profileImage }));
        } else {
          // If token is expired, dispatch token expired action and remove token from localStorage
          dispatch(setTokenExpired());
          console.log('Token is expired.');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // In case the token is invalid or cannot be decoded, logout the user
        dispatch(logoutUser());
        localStorage.removeItem('token');
      }
    } else {
      // If there's no token, dispatch logoutUser action
      dispatch(logoutUser());
      console.log('No token found.');
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default TokenCheckWrapper;
