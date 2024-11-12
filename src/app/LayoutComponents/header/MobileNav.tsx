'use client';

import Link from 'next/link'; // Correct import from next/link
import Logo from './Logo';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { closeMobileMenu, openMobileMenu } from '@/lib/features/UISlice';
import { logoutUser } from '@/lib/features/UserSlice'; // Assuming you have a logout action in your slice
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // To handle redirect after logout

const MobileNav = () => {
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const currentPath = useAppSelector((state) => state.ui.currentPath);
  const userType = useAppSelector((state) => state.user.userType); // Get userType from Redux
  const userProfileImage = useAppSelector((state) => state.user.profileImage); // Get user profile image from Redux
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // To check if the component is client-side rendered

  // Set client flag after mount to avoid SSR mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Toggle function for the mobile menu
  const toggleMenu = () => {
    if (isMobileMenuOpen) {
      dispatch(closeMobileMenu());
    } else {
      dispatch(openMobileMenu());
    }
  };

  // Handle link click to close the mobile menu
  const handleLinkClick = (path: string) => {
    if (currentPath === path) {
      dispatch(closeMobileMenu());
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Reset the user state in Redux
    dispatch(logoutUser()); // Assuming you have a logout action in the UserSlice

    // Redirect to login page
    router.push('/login');
  };

  // Render nothing or a loading state on initial render to avoid hydration issues
  if (!isClient) {
    return null; // Or use a loading spinner or placeholder
  }

  return (
    <nav className="bg-gray-950 text-white p-2 w-full relative border-b-2 border-b-slate-800">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          className="lg:hidden p-2 text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <div className="relative w-6 h-6">
            {/* Hamburger Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={`h-6 w-6 absolute text-slate-100 transition-opacity duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>

            {/* Close Icon (X) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={`h-6 w-6 text-red-600 absolute transition-opacity duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </button>
      </div>

      <div
        className={`${
          isMobileMenuOpen ? 'flex mt-2 space-x-2' : 'hidden'
        } mt-4 transition-all duration-500 ease-in-out transform relative w-full bg-gray-950 merriweather-bold`}
        style={{
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <ul className="space-y-2 lg:space-y-0 lg:flex z-20 w-full flex flex-col items-center justify-center">
          {userType === 'Guest' ? (
            // For guest users, show Login and Register
            <>
              <li>
                <Link
                  href="/login"
                  className={`block text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/login' ? 'text-sky-600' : ''}`}
                  onClick={() => handleLinkClick("/login")}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className={`block text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/register' ? 'text-sky-600' : ''}`}
                  onClick={() => handleLinkClick("/register")}
                >
                  Register
                </Link>
              </li>
            </>
          ) : (
            // For authenticated users, show Profile, Dashboard, Logout
            <>
              <li>
                <button
                  onClick={toggleMenu}
                  className="flex items-center justify-center space-x-2 w-full"
                >
                  <img
                    src={userProfileImage || '/default-avatar.png'} // Use default avatar if no image
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-sky-600"
                  />
                </button>
                <div
                  className={`${
                    isMobileMenuOpen ? 'block' : 'hidden'
                  } mt-2 space-y-2`}
                >
                  <ul className="flex flex-col items-center justify-center">
                    <li>
                      <Link
                        href="/dashboard"
                        className={`block text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/dashboard' ? 'text-sky-600' : ''}`}
                        onClick={() => handleLinkClick("/dashboard")}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className={`block text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/profile' ? 'text-sky-600' : ''}`}
                        onClick={() => handleLinkClick("/profile")}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block text-lg hover:text-gray-400 transition-colors duration-300 w-full text-left"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default MobileNav;
