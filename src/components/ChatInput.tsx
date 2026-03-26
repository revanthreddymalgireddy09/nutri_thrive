import React, { useRef } from 'react';
import { Send, Loader2, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isLoading,
  onInputChange,
  onSend
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-6 pb-6 pt-3">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel rounded-[28px] px-4 py-4">
          <div className="flex gap-4 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your dietary needs, ingredients available, or ask for recipe ideas..."
              className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60 text-slate-800 placeholder:text-slate-400"
              rows={1}
              style={{
                minHeight: '56px',
                maxHeight: '160px',
              }}
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className="h-14 px-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/15"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-xs text-slate-400">
            <span>Grounded recipe search with backend context</span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5" />
              Enter to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
