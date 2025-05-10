// /frontend/src/components/ChatMessage.tsx
interface ChatMessageProps {
    text: string;
    isUser: boolean;
  }
  
  const ChatMessage = ({ text, isUser }: ChatMessageProps) => {
    return (
      <div
        className={`p-4 rounded-lg max-w-md ${
          isUser
            ? 'bg-indigo-600 text-white ml-auto'
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-start">
          {!isUser && (
            <div className="flex-shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-bold">AI</span>
              </div>
            </div>
          )}
          <div className={isUser ? 'ml-auto' : ''}>
            <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {text}
            </p>
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