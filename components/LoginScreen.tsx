
import React, { useState } from 'react';
import { Languages, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface LoginScreenProps {
  language: SupportLanguage;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ language, onLoginSuccess }) => {
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const currentDomain = window.location.hostname;

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Failed to sign in'
      });
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center animate-slide-in">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-200">
          <Languages size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          FrenchMentor
        </h1>
        
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          {t.welcome}
        </h2>
        
        <p className="text-slate-500 mb-10 leading-relaxed">
          {t.loginDesc}
        </p>

        {error?.code === 'auth/unauthorized-domain' ? (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl text-left" dir="ltr">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <AlertCircle size={20} />
              <span>{t.domainErrorTitle}</span>
            </div>
            <p className="text-xs text-red-700 mb-4">
              {t.domainErrorDesc}
            </p>
            <div className="flex items-center gap-2 bg-white border border-red-200 p-2 rounded-lg mb-4">
              <code className="flex-1 text-xs font-mono text-slate-800 break-all">{currentDomain}</code>
              <button 
                onClick={copyDomain}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-400"
                title="Copy Domain"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {t.domainErrorSteps}
            </p>
            <button 
              onClick={handleLogin}
              className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error.message}</span>
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 px-6 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>{t.loginBtn}</span>
            </button>
          </>
        )}

        <p className="mt-8 text-xs text-slate-400">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
