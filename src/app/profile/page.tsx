'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { loginUser, setUserDetails } from '@/lib/features/UserSlice'; // Import Redux action
import axios from 'axios'; // For making API calls
import { states } from '@/app/helper/states'; // List of US States (abbreviations + names)
import { isTokenValid } from '../utils/token';
import { UserDetails } from '../types/UserDetails';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const Profile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user); // Access user from Redux

  // Local state to manage form inputs and loading state
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    address: user.address || '',
    phoneNumber: user.phoneNumber || '',
    profileImage: user.profileImage || '',
    selectedState: user.selectedState || '',
    zipCode: user.zipCode || '',
  });

  const [isLoading, setIsLoading] = useState(false); // Track if the form is being submitted

  // Set initial form state when user data changes
  useEffect(() => {
    if (user && user.username) {
      setFormData({
        username: user.username,
        email: user.email,
        address: user.address,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage || null as unknown as string,
        selectedState: user.selectedState,
        zipCode: user.zipCode,
      });
    }
  }, [user]);

  // Handle input changes for text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle state change (select box)
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      selectedState: value,
    }));
  };

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prevState) => ({
      ...prevState,
      profileImage: file || prevState.profileImage,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Show loading spinner

    try {
      // Prepare FormData to send the profile data including the image
      const formDataToSend = new FormData();
      formDataToSend.append('userId', user.id);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('selectedState', formData.selectedState);
      formDataToSend.append('zipCode', formData.zipCode);

      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage); // Append the profile image file
      }

      // Send the updated profile data to the backend using a PUT request
      const response = await axios.put('/api/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for sending files
        },
      });

      localStorage.setItem('token', response.data.token);

      if (isTokenValid(response.data.token)) {
        const decoded: UserDetails = jwt_decode(response.data.token);
        const { id, email, username, address, phoneNumber, profileImage, selectedState, zipCode } = decoded;

        // Update Redux state with user details
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
        const token = response.data.token;
        dispatch(loginUser({ token, email, username, profileImage }));
        
        // Use Toastify instead of alert
        toast.success('Profile updated successfully!'); // Show success toast

        window.location.reload();
      }
    } catch (error) {
      toast.error('Error updating profile. Please try again.'); // Show error toast if something goes wrong
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-12 text-gray-800">
      <h1 className="text-3xl font-semibold text-center mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Left Column - Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col">
            <label htmlFor="username" className="text-lg font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              readOnly
              value={formData.username}
              onChange={handleInputChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              readOnly
              value={formData.email}
              onChange={handleInputChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="text-lg font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Right Column - Address and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="address" className="text-lg font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="selectedState" className="text-lg font-medium text-gray-700">State</label>
            <select
              name="selectedState"
              id="selectedState"
              value={formData.selectedState}
              onChange={handleStateChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {states.map((state: { code: string, name: string }) => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="zipCode" className="text-lg font-medium text-gray-700">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              id="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="mt-2 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your zip code"
            />
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="flex flex-col space-y-4 mt-8">
          <label htmlFor="profileImage" className="text-lg font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            name="profileImage"
            id="profileImage"
            onChange={handleProfileImageChange}
            className="p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
            accept="image/*"
          />
          <div
            onClick={() => document.getElementById('profileImage')?.click()}
            className="cursor-pointer p-4 border border-gray-300 rounded-lg shadow-sm text-center text-gray-600 hover:bg-gray-100"
          >
            {formData.profileImage ? (
              <img
                src={typeof formData.profileImage === 'string' ? formData.profileImage : URL.createObjectURL(formData.profileImage)}
                alt="Profile"
                className="w-36 h-36 object-cover rounded-full border-4 border-blue-200 mx-auto"
              />
            ) : (
              <span>Click to upload profile image</span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="w-full sm:w-48 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
}

export default Profile;
