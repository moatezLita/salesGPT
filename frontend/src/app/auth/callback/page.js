// src/app/auth/callback/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback or email verification
    const handleAuthCallback = async () => {
      // Get the code from URL
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          // Redirect to the dashboard after successful authentication
          router.push('/analyze');
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          router.push('/auth/login?error=Authentication+failed');
        }
      } else {
        // No code in URL, redirect to login
        router.push('/auth/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-lg text-gray-600">Completing authentication...</p>
    </div>
  );
}