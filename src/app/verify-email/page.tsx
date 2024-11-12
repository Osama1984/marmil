'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Correct import for query params
import { NextPage } from "next";

// Define a type for the page's state
interface VerificationState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const VerifyEmailPage: NextPage = () => {
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    error: null,
  });

  const searchParams = useSearchParams(); // Use `useSearchParams` to get query parameters
  const token = searchParams.get('token'); // Extract the token from the query parameters

  // Effect to handle email verification
  useEffect(() => {
    if (!token) return; // Wait until token is available
    console.log(token);
    const verifyEmail = async () => {
      try {
        setState({ loading: true, success: false, error: null });

        // Send token to API to verify
        const response = await fetch(`/api/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setState({ loading: false, success: true, error: null });
        } else {
          setState({ loading: false, success: false, error: data.Message });
        }
      } catch (error) {
        setState({
          loading: false,
          success: false,
          error: "An unexpected error occurred",
        });
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div>
      <h1>Email Verification</h1>
      {state.loading && <p>Verifying your email...</p>}
      {!state.loading && state.success && (
        <p>Your email has been successfully verified! You can now log in.</p>
      )}
      {!state.loading && !state.success && state.error && (
        <p>Error: {state.error}</p>
      )}
    </div>
  );
};

export default VerifyEmailPage;
