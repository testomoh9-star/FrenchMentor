
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, BookOpen, Plus, History, Lightbulb, ChevronRight, Crown, Lock, UserCircle, MoreVertical, Trash2, Edit3, Check, X, PanelLeftClose } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS, Conversation, CoachLesson } from '../types';

interface SidebarProps {
  language: SupportLanguage;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  archivedLessons: CoachLesson[];
  onSelectLesson: (lesson: CoachLesson) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
  translateCat: (cat: string) => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  language,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  archivedLessons,
  onSelectLesson,
  isPro,
  onUpgradeClick,
  onClose,
  translateCat
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const isArabic = language === 'Arabic';
    
    if (mins < 1) return isArabic ? "الآن" : "Just now";
    if (mins < 60) return `${mins}m ${isArabic ? "مضت" : "ago"}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${isArabic ? "مضت" : "ago"}`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setRenamingValue(conv.title);
    setMenuOpenId(null);
  };

  const handleConfirmRename = (id: string) => {
    if (renamingValue.trim()) {
      onRenameChat(id, renamingValue.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className={`w-72 sm:w-80 bg-slate-900 flex flex-col h-full shrink-0 border-r border-slate-800 shadow-2xl transition-all z-[60] ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onNewChat}
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 group active:scale-[0.98]"
        >
          <div className="bg-blue-600 p-1 rounded-md text-white group-hover:scale-110 transition-transform">
            <Plus size={16} />
          </div>
          <span className="text-sm font-black tracking-tight">{t.newChat}</span>
        </button>
        <button 
          onClick={onClose}
          className="ml-2 p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all lg:hidden"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-2 space-y-8 pb-20 scrollbar-hide">
        
        {/* Recent Conversations */}
        <section className="space-y-1">
          <div className="px-4 py-2 flex items-center gap-2 text-white/30">
            <History size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.recentChats}</span>
          </div>
          <div className="space-y-0.5">
            {conversations.length === 0 ? (
              <p className="px-4 py-3 text-[10px] text-white/20 italic">No conversations yet</p>
            ) : (
              conversations.slice().reverse().map((conv) => (
                <div key={conv.id} className="relative group">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-blue-500/50">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={renamingValue}
                        onChange={(e) => setRenamingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 bg-transparent text-white text-xs font-bold outline-none"
                      />
                      <button onClick={() => handleConfirmRename(conv.id)} className="text-green-400 p-1 hover:bg-white/10 rounded-md">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onSelectChat(conv.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left pr-10 ${activeConversationId === conv.id ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate tracking-tight">{conv.title}</h4>
                        <span className="text-[9px] uppercase font-black opacity-30 mt-1 block">{formatTimeAgo(conv.timestamp)}</span>
                      </div>
                    </button>
                  )}
                  
                  {/* Actions Menu */}
                  {editingId !== conv.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === conv.id ? null : conv.id); }}
                         className={`p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-all ${menuOpenId === conv.id ? 'text-white bg-white/10' : 'opacity-0 group-hover:opacity-100'}`}
                       >
                         <MoreVertical size={14} />
                       </button>
                       
                       {menuOpenId === conv.id && (
                         <div className="absolute right-full top-0 mr-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1 z-[80] min-w-[100px] animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={() => handleStartRename(conv)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                            >
                              <Edit3 size={12} /> Rename
                            </button>
                            <button 
                              onClick={() => { onDeleteChat(conv.id); setMenuOpenId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Knowledge Library */}
        <section className="space-y-1">
          <div className="px-4 py-2 flex items-center gap-2 text-white/30">
            <BookOpen size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.archiveTitle}</span>
          </div>
          <div className="space-y-0.5">
            {!isPro ? (
              <div className="px-4 py-8 text-center space-y-4">
                <div className="bg-white/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto">
                  <Lock size={16} className="text-white/20" />
                </div>
                <button onClick={onUpgradeClick} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                  Unlock for PRO
                </button>
              </div>
            ) : archivedLessons.length === 0 ? (
              <p className="px-4 py-3 text-[10px] text-white/20 italic">Solve missions to archive</p>
            ) : (
              archivedLessons.slice().reverse().map((lesson) => (
                <button 
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-white/60 hover:bg-white/5 hover:text-white group"
                >
                  <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                    <Lightbulb size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-bold truncate tracking-tight">{lesson.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 opacity-30">
                      <p className="text-[8px] font-black uppercase tracking-widest truncate">{translateCat(lesson.category)}</p>
                      <span className="text-[8px]">•</span>
                      <span className="text-[8px] font-black uppercase">{formatTimeAgo(lesson.timestamp)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        {!isPro ? (
          <button 
            onClick={onUpgradeClick}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl shadow-indigo-500/10 active:scale-[0.98] transition-all hover:brightness-110"
          >
            <div className="flex items-center gap-2">
              <Crown size={14} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">Join Pro</span>
            </div>
            <ChevronRight size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs shadow-lg">
              <UserCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black text-white">PRO Student</p>
              <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Active Membership</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
