import React from 'react';
import { Languages, RefreshCw, ChevronDown, Cpu, Zap, Brain } from 'lucide-react';
import { SupportLanguage, ModelID } from '../types';

interface HeaderProps {
  onReset: () => void;
  language: SupportLanguage;
  setLanguage: (lang: SupportLanguage) => void;
  selectedModel: ModelID;
  setSelectedModel: (model: ModelID) => void;
}

const MODELS = [
  { id: 'gemini-flash-lite-latest', name: 'Lite', icon: Zap, desc: 'Fastest' },
  { id: 'gemini-3-flash-preview', name: 'Flash', icon: Cpu, desc: 'Balanced' },
  { id: 'gemini-3-pro-preview', name: 'Pro', icon: Brain, desc: 'Expert' }
] as const;

const Header: React.FC<HeaderProps> = ({ onReset, language, setLanguage, selectedModel, setSelectedModel }) => {
  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Languages size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight hidden sm:block">FrenchMentor</h1>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight sm:hidden">FM</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Selector */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:border-blue-400 transition-all shadow-sm">
            <activeModel.icon size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-slate-700 hidden xs:block">{activeModel.name}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              Engine Model
            </div>
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedModel === model.id ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <model.icon size={16} className={selectedModel === model.id ? 'text-blue-600' : 'text-slate-400'} />
                  <div>
                    <p className={`text-sm font-medium ${selectedModel === model.id ? 'text-blue-600' : 'text-slate-700'}`}>{model.name}</p>
                    <p className="text-[10px] text-slate-400">{model.desc}</p>
                  </div>
                </div>
                {selectedModel === model.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
            <span className="text-sm font-medium text-slate-700">{language}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          
          <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
            {(['English', 'French', 'Arabic'] as SupportLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${language === lang ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Start New Session"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;