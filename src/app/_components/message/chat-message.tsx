"use client";

import { UserCircle2 } from "lucide-react";

interface ChatMessageProps {
  children: React.ReactNode,
  isUser?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  children,
  isUser = false,
}) => {
  return (
    <div
      className={`flex items-start space-x-3 p-4 ${isUser ? "flex-row-reverse" : "flex-row"
        }`}
    >
      {!isUser && <UserCircle2 className="h-8 w-8" />}
      <div
        className={`rounded-lg p-3 text-gray-600 ${isUser
          ? "max-w-[60%] rounded-br-none bg-[#f5f9ff]"
          : "rounded-bl-none bg-[#fafafa]"
          }`}
        style={{ maxWidth: isUser ? "60%" : "auto" }}
      >
        {children}
      </div>
    </div>
  );
};
