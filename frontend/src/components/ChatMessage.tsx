// src/components/ChatMessage.tsx
interface ChatMessageProps {
  text: string;
  isUser: boolean;
  isVoice?: boolean;
}

const ChatMessage = ({ text, isUser, isVoice = false }: ChatMessageProps) => {
  return (
    <div
      className={`p-4 rounded-lg max-w-md ${
        isUser
          ? 'bg-indigo-600 text-white ml-auto'
          : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600'
      }`}
    >
      <div className="flex items-start">
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-300 font-bold">AI</span>
            </div>
          </div>
        )}
        <div className={isUser ? 'ml-auto' : ''}>
          <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {text}
          </p>
          
          {/* Voice message indicator */}
          {isVoice && (
            <div className="flex items-center mt-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-3 w-3 ${isUser ? 'text-indigo-200' : 'text-indigo-500 dark:text-indigo-400'} mr-1`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              </svg>
              <span className={`text-xs ${isUser ? 'text-indigo-200' : 'text-indigo-500 dark:text-indigo-400'}`}>
                Voice message
              </span>
            </div>
          )}
        </div>
        {isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center">
              <span className="text-white font-bold">You</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;