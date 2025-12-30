
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, ChevronRight, Crown, Lock, PanelLeft, SquarePen, Settings, MessageCircle, LogOut, Trash2, Edit3, Trash } from 'lucide-react';
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
        {/* Rail Column (Always visible icons) */}
        <div className="w-16 flex flex-col items-center py-4 border-r border-slate-800/50 shrink-0">
          <button onClick={onToggle} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-8">
            <PanelLeft size={22} />
          </button>
          <button onClick={onNewChat} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-4">
            <SquarePen size={22} />
          </button>

          <div className="mt-auto flex flex-col gap-2 relative">
            {userMenuOpen && (
              <div className={`absolute bottom-full mb-2 ${isRtl ? 'right-0' : 'left-0'} w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[100] animate-in slide-in-from-bottom-2 duration-200`}>
                <div className="flex items-center gap-3 p-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase">
                    {user.full_name?.slice(0, 2) || user.email.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.full_name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { onOpenSettings(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <Settings size={16} /> {t.settings}
                </button>
                <button onClick={() => { onOpenFeedback(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <MessageCircle size={16} /> {t.feedback}
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
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

        {/* Sidebar Content (Expanded) */}
        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{t.recentChats}</span>
            {conversations.length > 0 && (
              <button 
                onClick={onDeleteAllChats}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
                title={t.deleteAll}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-10 scrollbar-hide">
            {/* Conversations List */}
            <div className="space-y-1">
              {conversations.slice().reverse().map((conv) => (
                <div key={conv.id} className="relative group">
                  {editingId === conv.id ? (
                    <div className="px-3 py-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={renamingValue}
                        onChange={(e) => setRenamingValue(e.target.value)}
                        onBlur={() => handleConfirmRename(conv.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(conv.id)}
                        className="w-full bg-white/10 border border-blue-500 rounded-lg px-2 py-1 text-xs text-white outline-none"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => onSelectChat(conv.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${activeConversationId === conv.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      <h4 className="text-xs font-bold truncate flex-1">{conv.title}</h4>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setRenamingValue(conv.title); }}
                          className="p-1 hover:text-blue-400"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteChat(conv.id); }}
                          className="p-1 hover:text-red-400"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="px-3 py-8 text-center border-2 border-dashed border-white/5 rounded-2xl mx-1">
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">No history</p>
                </div>
              )}
            </div>

            {/* Knowledge Library */}
            <div className="space-y-4">
              <div className="px-3 flex items-center gap-2">
                <BookOpen size={14} className="text-white/30" />
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{t.archiveTitle}</span>
              </div>
              
              {!isPro ? (
                <div className="mx-2 p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/20">
                    <Lock size={18} />
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-tight">Unlock Library with Pro</span>
                  <button onClick={onUpgradeClick} className="text-[9px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Upgrade</button>
                </div>
              ) : archivedLessons.length === 0 ? (
                <div className="px-3 py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                   <p className="text-[10px] text-white/20 font-bold leading-relaxed">{t.archiveEmpty}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {archivedLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group text-left"
                    >
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{translateCat(lesson.category)}</span>
                        <h5 className="text-[11px] font-bold truncate w-full">{lesson.title}</h5>
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-white/5">
            <button onClick={onUpgradeClick} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-between text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-all">
               <span>{isPro ? 'Pro Member' : 'Join Pro'}</span>
               <Crown size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
