'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { UserDetails } from '@/app/types/UserDetails';
import { loginUser, setUserDetails } from '@/lib/features/UserSlice';
import { jwtDecode as jwt_decode } from 'jwt-decode';

// Utility function for token validation
import { isTokenValid } from '@/app/utils/token';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    // Send login request to API
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.Message || 'Login failed');
        return;
      }

      const token = data.token;
      localStorage.setItem('token', token);

      if (isTokenValid(token)) {
        const decoded: UserDetails = jwt_decode(token);
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

        dispatch(loginUser({ token, email, username, profileImage }));
        // Redirect to the authenticated page (e.g., Dashboard)
        router.push('/');
      } else {
        setError('Session has expired, please log in again');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-transparent min-h-full flex-col">
      <div className="bg-transparent p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-bold text-center mb-6 merriweather-regular text-white">
          Login To Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg"
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
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-4">
            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Login
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center text-white">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
