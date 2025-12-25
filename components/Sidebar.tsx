
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, History, Lightbulb, ChevronRight, Crown, Lock, UserCircle, MoreVertical, Trash2, Edit3, Check, PanelLeft, SquarePen, Menu } from 'lucide-react';
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
  isExpanded: boolean;
  onToggle: () => void;
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
  isExpanded,
  onToggle,
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

  // Click away listener for the more menu
  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      if (menuOpenId) {
        const target = e.target as HTMLElement;
        if (!target.closest('.chat-menu-container')) {
          setMenuOpenId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [menuOpenId]);

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

  const handleStartRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
          onClick={onToggle}
        />
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
        {/* THE RAIL */}
        <div className="w-16 flex flex-col items-center py-4 border-r border-slate-800/50 shrink-0">
          <button 
            onClick={onToggle}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-8"
          >
            <PanelLeft size={22} />
          </button>

          <button 
            onClick={onNewChat}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-4"
            title={t.newChat}
          >
            <SquarePen size={22} />
          </button>

          <div className="mt-auto flex flex-col gap-4">
            {!isPro && (
              <button 
                onClick={onUpgradeClick}
                className="p-3 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 rounded-xl transition-all"
                title="Upgrade to Pro"
              >
                <Crown size={20} />
              </button>
            )}
            <button className="p-3 text-slate-500 hover:text-white transition-all">
              <UserCircle size={24} />
            </button>
          </div>
        </div>

        {/* THE PANEL */}
        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{t.recentChats}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-8 scrollbar-hide">
            <section className="space-y-0.5">
              {conversations.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[10px] text-white/20 italic">No recent chats</p>
                </div>
              ) : (
                conversations.slice().reverse().map((conv) => (
                  <div 
                    key={conv.id} 
                    className={`relative group ${menuOpenId === conv.id ? 'z-50' : 'z-10'}`}
                  >
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-blue-500/50">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={renamingValue}
                          onChange={(e) => setRenamingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 bg-transparent text-white text-xs font-bold outline-none min-w-0"
                        />
                        <button onClick={() => handleConfirmRename(conv.id)} className="text-green-400 p-1 hover:bg-white/10 rounded-md">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onSelectChat(conv.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left pr-10 ${activeConversationId === conv.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold truncate tracking-tight">{conv.title}</h4>
                          <span className="text-[9px] uppercase font-black opacity-30 mt-0.5 block">{formatTimeAgo(conv.timestamp)}</span>
                        </div>
                      </button>
                    )}
                    
                    {editingId !== conv.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 chat-menu-container">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === conv.id ? null : conv.id); }}
                           className={`p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-all ${menuOpenId === conv.id ? 'text-white bg-white/10 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                         >
                           <MoreVertical size={14} />
                         </button>
                         
                         {menuOpenId === conv.id && (
                           <div className="absolute right-full top-0 mr-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-[100] min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                              <button 
                                onClick={(e) => handleStartRename(e, conv)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                              >
                                <Edit3 size={14} /> Rename
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(conv.id); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            <section className="space-y-1">
              <div className="px-4 py-2 flex items-center gap-2 text-white/30">
                <BookOpen size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.archiveTitle}</span>
              </div>
              <div className="space-y-0.5 px-1">
                {!isPro ? (
                  <div className="px-4 py-6 text-center bg-white/5 rounded-2xl mx-1">
                    <Lock size={16} className="text-white/10 mx-auto mb-2" />
                    <button onClick={onUpgradeClick} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                      Unlock Pro
                    </button>
                  </div>
                ) : archivedLessons.length === 0 ? (
                  <p className="px-4 py-3 text-[10px] text-white/10 italic">Library is empty</p>
                ) : (
                  archivedLessons.slice().reverse().map((lesson) => (
                    <button 
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left text-white/50 hover:bg-white/5 hover:text-white group"
                    >
                      <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                        <Lightbulb size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-bold truncate tracking-tight">{lesson.title}</h4>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="p-4 border-t border-white/5 bg-slate-950/40">
            {isPro ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                  <Crown size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white truncate">Pro Member</p>
                  <p className="text-[8px] text-white/30 uppercase font-black">Accelerated Learning</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={onUpgradeClick}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Crown size={14} className="text-white/80 group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Join Pro</span>
                </div>
                <ChevronRight size={14} className="text-white/50 group-hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Floating mobile toggle when collapsed */}
      {isMobile && !isExpanded && (
        <button 
          onClick={onToggle}
          className="fixed top-4 left-4 z-[100] p-3 bg-white shadow-xl rounded-xl text-slate-600 active:scale-95"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
