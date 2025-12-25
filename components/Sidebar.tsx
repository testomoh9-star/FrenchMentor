
import React from 'react';
import { MessageSquare, BookOpen, Plus, Clock, History, Lightbulb, ChevronRight, Crown, Lock, UserCircle } from 'lucide-react';
import { SupportLanguage, UI_TRANSLATIONS, Conversation, CoachLesson } from '../types';

interface SidebarProps {
  language: SupportLanguage;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  archivedLessons: CoachLesson[];
  onSelectLesson: (lesson: CoachLesson) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
  translateCat: (cat: string) => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  language,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
  archivedLessons,
  onSelectLesson,
  isPro,
  onUpgradeClick,
  translateCat
}) => {
  const t = UI_TRANSLATIONS[language];
  const isRtl = language === 'Arabic';

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

  return (
    <aside className={`w-full lg:w-72 bg-slate-900 flex flex-col h-full shrink-0 border-r border-slate-800 transition-all z-[60] ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 group active:scale-[0.98]"
        >
          <div className="bg-blue-600 p-1 rounded-md text-white group-hover:scale-110 transition-transform">
            <Plus size={16} />
          </div>
          <span className="text-sm font-black tracking-tight">{t.newChat}</span>
        </button>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-2 space-y-8 pb-20 scrollbar-hide">
        
        {/* Recent Conversations */}
        <section className="space-y-1">
          <div className="px-4 py-2 flex items-center gap-2 text-white/30">
            <MessageSquare size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.recentChats}</span>
          </div>
          <div className="space-y-0.5">
            {conversations.length === 0 ? (
              <p className="px-4 py-3 text-[10px] text-white/20 italic">No conversations yet</p>
            ) : (
              conversations.slice().reverse().map((conv) => (
                <button 
                  key={conv.id}
                  onClick={() => onSelectChat(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${activeConversationId === conv.id ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate tracking-tight">{conv.title}</h4>
                    <span className="text-[9px] uppercase font-black opacity-30 mt-1 block">{formatTimeAgo(conv.timestamp)}</span>
                  </div>
                </button>
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

      {/* Pro Badge / User */}
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
