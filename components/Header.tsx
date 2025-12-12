import React from 'react';
import { Languages, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Languages size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight">FrenchMentor</h1>
        </div>
      </div>
      
      <button 
        onClick={onReset}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Start New Session"
      >
        <RefreshCw size={20} />
      </button>
    </header>
  );
};

export default Header;