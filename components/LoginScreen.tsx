
import React from 'react';
import { Languages, LogIn } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface LoginScreenProps {
  language: SupportLanguage;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ language, onLoginSuccess }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (error) {
      alert("Failed to sign in. Please try again.");
    }
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
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 px-6 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>{t.loginBtn}</span>
        </button>

        <p className="mt-8 text-xs text-slate-400">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
