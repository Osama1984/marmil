'use client';

import Link from 'next/link'; // Correct import from next/link
import Logo from './Logo';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/lib/features/UserSlice'; // Assuming you have a logout action in your slice
import { useRouter } from 'next/navigation'; // To handle redirect after logout

const TabletNav = () => {
  const currentPath = useAppSelector((state) => state.ui.currentPath);
  const userType = useAppSelector((state) => state.user.userType); // Get userType from Redux
  const userProfileImage = useAppSelector((state) => state.user.profileImage); // Get the user's profile image

  // State to manage dropdown visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Toggle the dropdown menu visibility
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Logout function
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Reset the user state in Redux
    dispatch(logoutUser()); // Assuming you have a logout action in the UserSlice

    // Redirect to login page or home
    router.push('/login');
  };

  return (
    <nav className="bg-gray-950 text-white p-2 w-full relative border-b-2 border-b-slate-800 px-4">
      {/* Logo and Navigation */}
      <div className="flex items-center justify-between">
        <Logo />

        {/* Tablet Menu (Visible on medium screens and up) */}
        <div className="flex">
          <ul className="flex space-x-6">
            {userType === 'Guest' ? (
              // For guest users, show Login and Register
              <>
                <li>
                  <Link
                    href="/login"
                    className={`text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/login' ? 'text-sky-600' : ''}`}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className={`text-lg hover:text-gray-400 transition-colors duration-300 ${currentPath === '/register' ? 'text-sky-600' : ''}`}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              // For authenticated users, show Profile, Dashboard, and Logout with dropdown
              <>
                <li>
                  <div className="relative">
                    <button onClick={toggleDropdown} className="flex items-center">
                      <img
                        src={userProfileImage || '/default-avatar.png'} // Use default avatar if no image
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-sky-600"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg border border-sky-600 z-10">
                        <ul className="py-2">
                          <li>
                            <Link
                              href="/dashboard"
                              className={`block px-4 py-2 text-lg hover:bg-gray-700 transition-colors duration-300 ${currentPath === '/dashboard' ? 'text-sky-600' : ''}`}
                            >
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/profile"
                              className={`block px-4 py-2 text-lg hover:bg-gray-700 transition-colors duration-300 ${currentPath === '/profile' ? 'text-sky-600' : ''}`}
                            >
                              Profile
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleLogout}
                              className="block px-4 py-2 text-lg hover:bg-gray-700 transition-colors duration-300 w-full text-left"
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TabletNav;
