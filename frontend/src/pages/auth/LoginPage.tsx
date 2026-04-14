import React, { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from 'components/molecules/GoogleLoginButton';
import { useGoogleLogin } from 'hooks/useAuth';
import { isAuthenticatedSession, setAuthenticatedSession } from 'lib/auth-session';

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 620;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: loginWithGoogle, isPending: isLoadingUrl } = useGoogleLogin();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (isAuthenticatedSession()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  // Dengarkan pesan sukses dari popup AuthCallbackPage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
        setAuthenticatedSession();
        setIsPending(false);
        popupRef.current?.close();
        navigate('/home', { replace: true });
      }
      if (event.data?.type === 'GOOGLE_LOGIN_ERROR') {
        setIsPending(false);
        setErrorMessage(event.data.message || 'Login Google gagal, silakan coba lagi.');
        popupRef.current?.close();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      const result = await loginWithGoogle();
      if (!result?.redirectUrl) {
        throw new Error('Gagal mendapatkan URL login Google.');
      }

      // Buka popup di tengah layar
      const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
      const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
      const popup = window.open(
        result.redirectUrl,
        'google-login',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        // Popup diblokir browser → fallback full redirect
        window.location.assign(result.redirectUrl);
        return;
      }

      popupRef.current = popup;
      setIsPending(true);

      // Pantau jika user tutup popup manual
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsPending(false);
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login Google gagal, silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Masuk ke Cravana</h1>
          <p className="mt-2 text-sm text-gray-500">Gunakan akun Google untuk login cepat dan aman.</p>
        </div>
        <GoogleLoginButton disabled={isPending || isLoadingUrl} onClick={handleGoogleLogin} />
        {(isPending || isLoadingUrl) && (
          <p className="mt-4 text-center text-sm text-gray-500">Memproses login Google...</p>
        )}
        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
