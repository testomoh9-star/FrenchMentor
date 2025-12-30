
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS } from '../types';

interface DeleteConfirmModalProps {
  language: SystemLanguage;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ language, onClose, onConfirm }) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 sm:p-10 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
            {t.deleteConfirmTitle}
          </h3>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            {t.deleteConfirmDesc}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onConfirm}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-100"
            >
              <Trash2 size={20} />
              {t.confirmDeletion}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-black text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
