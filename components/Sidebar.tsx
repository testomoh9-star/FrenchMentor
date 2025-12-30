
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, History, Lightbulb, ChevronRight, Crown, Lock, UserCircle, MoreVertical, Trash2, Edit3, Check, PanelLeft, SquarePen, Menu, Settings, MessageCircle, LogOut, Sparkles } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS, Conversation, CoachLesson, User } from '../types';

interface SidebarProps {
  language: SystemLanguage;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteAllChats: () => void;
  archivedLessons: CoachLesson[];
  onSelectLesson: (lesson: CoachLesson) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  translateCat: (cat: string) => string;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({
  language,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onDeleteAllChats,
  archivedLessons,
  onSelectLesson,
  isPro,
  onUpgradeClick,
  isExpanded,
  onToggle,
  translateCat,
  onOpenSettings,
  onOpenFeedback,
  onLogout,
  user
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const handleConfirmRename = (id: string) => {
    if (renamingValue.trim()) onRenameChat(id, renamingValue.trim());
    setEditingId(null);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {isMobile && isExpanded && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]" onClick={onToggle} />
      )}

      <aside 
        className={`
          flex h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 z-[90]
          ${isExpanded ? 'w-72 sm:w-80' : 'w-16'}
          ${isMobile ? `fixed inset-y-0 left-0 ${isExpanded ? 'translate-x-0' : '-translate-x-full'}` : 'relative'}
          ${isRtl ? 'font-arabic flex-row-reverse' : 'flex-row'}
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-16 flex flex-col items-center py-4 border-r border-slate-800/50 shrink-0">
          <button onClick={onToggle} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-8">
            <PanelLeft size={22} />
          </button>
          <button onClick={onNewChat} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-4">
            <SquarePen size={22} />
          </button>

          <div className="mt-auto flex flex-col gap-2 relative user-menu-container">
            {userMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[100] animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-3 p-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase">
                    {user.full_name?.slice(0, 2) || user.email.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black dark:text-white truncate">{user.full_name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { onOpenSettings(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <Settings size={16} /> {t.settings}
                </button>
                <button onClick={() => { onOpenFeedback(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <MessageCircle size={16} /> {t.feedback}
                </button>
                <div className="h-px bg-slate-100 dark:border-slate-800 my-2" />
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut size={16} /> {t.logout}
                </button>
              </div>
            )}
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-[10px] uppercase">
                {user.email.slice(0, 1)}
              </div>
            </button>
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{t.recentChats}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-8 scrollbar-hide">
            {conversations.slice().reverse().map((conv) => (
               <button 
                key={conv.id}
                onClick={() => onSelectChat(conv.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeConversationId === conv.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
               >
                 <h4 className="text-xs font-bold truncate">{conv.title}</h4>
               </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button onClick={onUpgradeClick} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
               <span>{isPro ? 'Pro Active' : 'Join Pro'}</span>
               <Crown size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
