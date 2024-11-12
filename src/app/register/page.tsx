'use client';

import { closeMobileMenu, setCurrentPath } from '@/lib/features/UISlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import DropZone from '../components/DropZone'; // Import DropZone component
import { states } from '../helper/states';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import { useRouter } from 'next/navigation';

const Register = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [selectedState, setSelectedState] = useState<string>(''); // State for the selected state
  const [zipCode, setZipCode] = useState<string>(''); // State for ZIP code

  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const currentPath = useAppSelector((state) => state.ui.currentPath);
  const path = usePathname();

  useEffect(() => {
    if (isMobileMenuOpen && path !== currentPath) {
      dispatch(closeMobileMenu());
    }
    dispatch(setCurrentPath(path));
  }, [path, dispatch, isMobileMenuOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error state
  
    // Basic validation
    if (!email || !username || !password || !confirmPassword || !address || !phoneNumber || !selectedState || !zipCode) {
      setError('Please fill in all fields.');
      return;
    }
  
    // Password matching validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    // Email regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
  
    // Phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number (10 digits).');
      return;
    }
  
    // Username validation (3-16 characters, alphanumeric and special characters allowed)
    const usernameRegex = /^[a-zA-Z0-9 _-]{3,16}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be between 3 and 16 characters and can only contain letters, numbers, spaces, hyphens, and underscores.');
      return;
    }
  
    // Password validation (at least 8 characters, one lowercase, one uppercase, one number, one special character)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters, with at least one lowercase letter, one uppercase letter, one number, and one special character.');
      return;
    }
  
    // ZIP Code validation (basic check for 5 digits)
    const zipCodeRegex = /^[0-9]{5}$/;
    if (!zipCodeRegex.test(zipCode)) {
      setError('Please enter a valid ZIP code (5 digits).');
      return;
    }
  
    try {
      // Prepare form data (using FormData to send files)
      const formData = new FormData();
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('address', address);
      formData.append('phoneNumber', phoneNumber);
      formData.append('selectedState', selectedState);
      formData.append('zipCode', zipCode);
  
      if (profileImage) {
        formData.append('profileImage', profileImage); // Append the image directly
      }
  
      // API Request to backend
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData, // Using FormData to send both text and file data
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.status === 201) {
          toast.success(data.Message);
          router.push('/login');
          // Clear form data after successful registration
          setEmail('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setAddress('');
          setPhoneNumber('');
          setZipCode('');
          setSelectedState('');
          setProfileImage(null);
        } else {
          toast.error(data.Message);
        }
      } 
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred during registration');
    }
  };
  

  // Handle profile image drop
  const onProfileImageDrop = (acceptedFiles: File[]) => {
    setProfileImage(acceptedFiles[0]);
    console.log('Profile image uploaded:', acceptedFiles[0]);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setProfileImage(null); // Remove the image by setting the state to null
  };

  return (
    <>
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <div className="bg-transparent p-8 rounded-lg shadow-lg w-96 max-w-lg">
        <h2 className="text-3xl font-bold text-center mb-8 merriweather-regular text-white">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 text-slate-400">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-2 text-white">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-white">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-white">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold mb-2 text-white">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold mb-2 text-white">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          {/* State Select */}
          <div>
            <label htmlFor="state" className="block text-sm font-semibold mb-2 text-white">State</label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-slate-950 gap-2 bg-slate-200 text-xl"
            >
              <option value="">Select a state</option>
              {states.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* ZIP Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-semibold mb-2 text-white">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter your ZIP code"
              className="w-full p-4 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Profile Image Dropzone */}
          <DropZone onDrop={onProfileImageDrop} accept={{
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': [],
            'image/jfif': [],
          }}
            maxFiles={1}
            label="Upload your profile image"
            multiple={false}
          />

          {/* Display profile image and remove button */}
          {profileImage && (
            <div className="text-center mb-6">
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full mx-auto mb-2"
              />
              <div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-6">
            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Register
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-white">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">Login here</a>
        </p>
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeButton  />
    </>
  );
};

export default Register;

