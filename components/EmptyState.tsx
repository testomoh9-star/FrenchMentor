import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  "Je suis très contente de te voir",
  "How do you say 'I need to book a table' in French?",
  "J'ai aller au cinema hier",
  "Il faut que je vais partir maintenant"
];

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="bg-indigo-50 p-6 rounded-full mb-6 animate-fade-in-up">
        <MessageSquarePlus size={48} className="text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Bonjour ! Ready to learn?</h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        Type a phrase in French to get corrections and explanations, or type in English to get a translation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-sm text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-slate-700"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;