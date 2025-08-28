import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router';
import supabase from '@/supabase/supabase';

export default function GoogleCallback() {
  const { isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("Processing Google OAuth callback...");
        
        // Get the current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session error:", error);
          throw error;
        }
        
        if (data.session?.user) {
          console.log("Supabase session found:", data.session.user.email);
          // The auth state change listener in AuthContext will handle the rest
          
          // Wait a moment for the auth context to process
          setTimeout(() => {
            setProcessing(false);
          }, 2000);
        } else {
          console.log("No Supabase session found");
          throw new Error("No authentication session found");
        }
      } catch (error) {
        console.error('Google callback processing error:', error);
        setProcessing(false);
        navigate('/signin?error=google_auth_failed');
      }
    };

    processCallback();
  }, [navigate]);

  // Navigate when authentication is successful
  useEffect(() => {
    if (!processing && !isLoading && isAuthenticated) {
      console.log("Authentication successful, navigating to dashboard");
      navigate('/dashboard');
    }
  }, [processing, isLoading, isAuthenticated, navigate]);

  // Handle errors
  useEffect(() => {
    if (!processing && !isLoading && error) {
      console.error("Authentication error:", error);
      navigate('/signin?error=authentication_failed');
    }
  }, [processing, isLoading, error, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google authentication...</p>
        {error && (
          <p className="text-red-600 mt-2 text-sm">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}