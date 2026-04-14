import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from 'lib/supabase';
import { authService } from 'services/auth/authService';
import { setAuthenticatedSession } from 'lib/auth-session';

/**
 * AuthCallbackPage
 * Halaman ini dipanggil setelah Supabase menyelesaikan Google OAuth.
 * Flow:
 * 1. Supabase JS client otomatis memproses hash/code dari URL
 * 2. Kita ambil access_token dari session Supabase
 * 3. Kirim ke backend POST /api/auth/google/verify untuk issue custom JWT (cookie)
 * 4. Set flag session di localStorage, redirect ke /home
 */
const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const handleSession = async (accessToken: string) => {
      if (processed.current) return;
      processed.current = true;

      const isPopup = !!window.opener && window.opener !== window;

      try {
        await authService.verifyGoogleToken(accessToken);
        setAuthenticatedSession();

        if (isPopup) {
          window.opener.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS' }, window.location.origin);
          window.close();
          return;
        }

        navigate('/home', { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verifikasi login Google gagal.';

        if (isPopup) {
          window.opener.postMessage(
            { type: 'GOOGLE_LOGIN_ERROR', message },
            window.location.origin
          );
          window.close();
          return;
        }

        setStatus('error');
        setErrorMessage(message);
      }
    };

    const init = async () => {
      // 1. Coba parse access_token langsung dari URL hash
      //    Format: /auth/callback#access_token=...&refresh_token=...
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set session ke Supabase client agar konsisten, lalu proses
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        // Bersihkan hash dari URL bar tanpa reload
        window.history.replaceState(null, '', window.location.pathname);
        await handleSession(accessToken);
        return;
      }

      // 2. Fallback: session sudah ada (PKCE flow atau re-visit)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        await handleSession(sessionData.session.access_token);
        return;
      }

      // 3. Fallback terakhir: tunggu event SIGNED_IN (implicit flow tanpa hash)
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.access_token) {
          await handleSession(session.access_token);
        }
      });

      unsubscribe = () => data.subscription.unsubscribe();

      // Timeout 15 detik
      setTimeout(() => {
        if (!processed.current) {
          setStatus('error');
          setErrorMessage('Waktu habis saat menunggu konfirmasi dari Google. Silakan coba lagi.');
        }
      }, 15_000);
    };

    init();

    return () => {
      unsubscribe?.();
    };
  }, [navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-red-600 text-center max-w-sm">{errorMessage}</p>
        <button
          className="text-sm text-blue-600 underline hover:text-blue-800"
          onClick={() => navigate('/login', { replace: true })}
        >
          Kembali ke halaman login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-sm text-gray-500">Memproses login Google, mohon tunggu...</p>
    </div>
  );
};

export default AuthCallbackPage;
