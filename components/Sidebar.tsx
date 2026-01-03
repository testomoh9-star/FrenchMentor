
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Lightbulb, ChevronRight, Crown, Lock, Settings, MessageCircle, LogOut, Sparkles, PanelLeft, SquarePen, MoreVertical, Edit3, Trash2, Check, AlertTriangle, X } from 'lucide-react';
import { SystemLanguage, UI_TRANSLATIONS, Conversation, CoachLesson } from '../types';

interface SidebarProps {
  language: SystemLanguage;
  userEmail: string | null;
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
}

const Sidebar: React.FC<SidebarProps> = ({
  language,
  userEmail,
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
  onLogout
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | 'all' | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const initials = useMemo(() => {
    if (!userEmail) return 'LL';
    const parts = userEmail.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }, [userEmail]);

  const displayName = useMemo(() => {
    if (!userEmail) return 'Guest';
    return userEmail.split('@')[0];
  }, [userEmail]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuOpenId && !target.closest('.chat-menu-container')) {
        setMenuOpenId(null);
      }
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [menuOpenId, userMenuOpen]);

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

  const handleDeleteAll = () => {
    onDeleteAllChats();
    setDeleteConfirmId(null);
  };

  const handleDeleteSingle = (id: string) => {
    onDeleteChat(id);
    setDeleteConfirmId(null);
    setMenuOpenId(null);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {isMobile && isExpanded && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]" onClick={onToggle} />
      )}

      {/* Global Delete All Confirmation */}
      {deleteConfirmId === 'all' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className={`bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${isRtl ? 'font-arabic text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                 <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{t.deleteConfirmTitle}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{t.deleteConfirmDesc}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={handleDeleteAll} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-sm hover:bg-red-700 transition-all active:scale-95">
                    {t.confirmDeletion}
                 </button>
                 <button onClick={() => setDeleteConfirmId(null)} className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-black text-sm hover:bg-slate-200 transition-all">
                    {t.cancel}
                 </button>
              </div>
           </div>
        </div>
      )}

      <aside 
        className={`
          flex h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 z-[90]
          ${isExpanded ? 'w-72 sm:w-80' : 'w-16'}
          ${isMobile ? `fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} ${isExpanded ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}` : 'relative'}
          ${isRtl ? 'font-arabic flex-row-reverse border-l' : 'flex-row'}
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* THE RAIL */}
        <div className={`w-16 flex flex-col items-center py-4 shrink-0 border-slate-800/50 ${isRtl ? 'border-l' : 'border-r'}`}>
          <button onClick={onToggle} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-8">
            <PanelLeft size={22} className={isRtl ? 'scale-x-[-1]' : ''} />
          </button>

          <button onClick={onNewChat} className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all mb-4" title={t.newChat}>
            <SquarePen size={22} />
          </button>

          <div className="mt-auto flex flex-col gap-2 relative user-menu-container">
            {userMenuOpen && (
              <div 
                className={`absolute bottom-full mb-2 ${isRtl ? 'right-0' : 'left-0'} w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] animate-in slide-in-from-bottom-2 duration-200 overflow-hidden`}
                dir={isRtl ? 'rtl' : 'ltr'}
                style={{ insetInlineStart: isRtl ? 'auto' : '0', insetInlineEnd: isRtl ? '0' : 'auto' }}
              >
                <div className={`flex items-center gap-3 p-3 mb-2 border-b border-slate-100 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shrink-0">{initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>

                {!isPro && (
                  <button onClick={() => { onUpgradeClick(); setUserMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Sparkles size={16} className="text-cyan-500" /> {t.upgradeTitle}
                  </button>
                )}
                
                <button onClick={() => { onOpenSettings(); setUserMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Settings size={16} /> {t.settings}
                </button>
                
                <button onClick={() => { onOpenFeedback(); setUserMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <MessageCircle size={16} /> {t.feedback}
                </button>

                <div className="h-px bg-slate-100 my-2" />
                
                <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <LogOut size={16} /> {t.logout}
                </button>
              </div>
            )}
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`p-2 rounded-xl transition-all ${userMenuOpen ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">{initials}</div>
            </button>
          </div>
        </div>

        {/* THE PANEL */}
        <div className={`flex-1 flex flex-col min-w-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`p-4 border-b border-white/5 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{t.recentChats}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-8 scrollbar-hide">
            <section className="space-y-0.5">
              {conversations.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[10px] text-white/20 italic">No recent chats</p>
                </div>
              ) : (
                <>
                  {conversations.slice().reverse().map((conv) => (
                    <div key={conv.id} className={`relative group ${menuOpenId === conv.id ? 'z-50' : 'z-10'}`}>
                      {editingId === conv.id ? (
                        <div className={`flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-blue-500/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <input
                            ref={editInputRef}
                            type="text"
                            value={renamingValue}
                            onChange={(e) => setRenamingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename(conv.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className={`flex-1 bg-transparent text-white text-xs font-bold outline-none min-w-0 ${isRtl ? 'text-right' : ''}`}
                          />
                          <button onClick={() => handleConfirmRename(conv.id)} className="text-green-400 p-1 hover:bg-white/10 rounded-md">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onSelectChat(conv.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${activeConversationId === conv.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold truncate tracking-tight">{conv.title}</h4>
                            <span className="text-[9px] uppercase font-black opacity-30 mt-0.5 block">{formatTimeAgo(conv.timestamp)}</span>
                          </div>
                        </button>
                      )}
                      
                      {editingId !== conv.id && (
                        <div className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 chat-menu-container`}>
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === conv.id ? null : conv.id); }} className={`p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-all ${menuOpenId === conv.id ? 'text-white bg-white/10 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <MoreVertical size={14} />
                          </button>
                          {menuOpenId === conv.id && (
                            <div 
                              className={`absolute ${isRtl ? 'left-full ml-2' : 'right-full mr-2'} top-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-[100] min-w-[160px] animate-in fade-in zoom-in-95 duration-150 overflow-hidden`}
                              style={{ insetInlineStart: isRtl ? 'calc(100% + 8px)' : 'auto', insetInlineEnd: isRtl ? 'auto' : 'calc(100% + 8px)' }}
                            >
                                {deleteConfirmId === conv.id ? (
                                  <div className="p-1 space-y-2">
                                     <p className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center px-2">Sure?</p>
                                     <div className="flex gap-1">
                                        <button onClick={() => handleDeleteSingle(conv.id)} className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all">
                                           <Check size={14} className="mx-auto" />
                                        </button>
                                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-slate-700 text-white p-2 rounded-lg hover:bg-slate-600 transition-all">
                                           <X size={14} className="mx-auto" />
                                        </button>
                                     </div>
                                  </div>
                                ) : (
                                  <>
                                    <button onClick={(e) => handleStartRename(e, conv)} className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                      <Edit3 size={14} /> {isRtl ? 'إعادة تسمية' : 'Rename'}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                      <Trash2 size={14} /> {isRtl ? 'حذف' : 'Delete'}
                                    </button>
                                  </>
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="px-2 pt-2">
                    <button 
                      onClick={() => setDeleteConfirmId('all')}
                      className="w-full py-2 px-4 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold transition-all text-center"
                    >
                      {t.deleteAll}
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="space-y-1">
              <div className={`px-4 py-2 flex items-center gap-2 text-white/30 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <BookOpen size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.archiveTitle}</span>
              </div>
              <div className="space-y-0.5 px-1">
                {!isPro ? (
                  <div className="px-4 py-6 text-center bg-white/5 rounded-2xl mx-1">
                    <Lock size={16} className="text-white/10 mx-auto mb-2" />
                    <button onClick={onUpgradeClick} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300">
                      Unlock Pro
                    </button>
                  </div>
                ) : archivedLessons.length === 0 ? (
                  <p className="px-4 py-3 text-[10px] text-white/10 italic">Library is empty</p>
                ) : (
                  archivedLessons.slice().reverse().map((lesson) => (
                    <button key={lesson.id} onClick={() => onSelectLesson(lesson)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} text-white/50 hover:bg-white/5 hover:text-white group`}>
                      <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400 group-hover:bg-gradient-to-br group-hover:from-cyan-400 group-hover:to-indigo-500 group-hover:text-white transition-all shrink-0">
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
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
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
                className={`w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white flex items-center justify-between transition-all group shadow-lg shadow-indigo-900/20 active:scale-[0.98] ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Crown size={14} className="text-white/80 group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Join Pro</span>
                </div>
                <ChevronRight size={14} className={`text-white/50 group-hover:text-white ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
