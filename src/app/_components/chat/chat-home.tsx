"use client";

import { Heart, CircleArrowRight } from "lucide-react";
import { ChatMessage } from "~/app/_components/message/chat-message";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useChat, type Message } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import ShineBorder from "@components/ui/shine-border";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@components/ui/dropdown-menu";
import UpdateProfile from "../profile/update-profile";

interface Emotion {
  emotion: string;
  emoji: string;
}

export default function ChatHome() {
  const emotions: Emotion[] = [
    { emotion: "happy", emoji: "😊" },
    { emotion: "sad", emoji: "😔" },
    { emotion: "angry", emoji: "😡" },
    { emotion: "romantic", emoji: "🌹" },
  ];

  // object has the same name as the slug in the URL
  const { chats } = useParams();
  const chatId = Array.isArray(chats) ? chats[0] : chats;

  // handles getting profile data from the db and setting it in the UI
  const {
    data: dataChat,
    isLoading: isLoadingChat,
    isSuccess: isSuccessChat,
  } = api.chat.getChat.useQuery(chatId ? { chatId: chatId } : skipToken, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!chatId,
  });

  const redHeartLevel = dataChat?.heartLevel;
  const relationship = dataChat?.relationship;
  const name = dataChat?.name;
  const grayHeartLevel = redHeartLevel ? 5 - redHeartLevel : 0;

  // handle openai api call
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [shouldSubmit, setShouldSubmit] = useState(false);

  // useChat() hook sends a HTTP POST request to /api/chat endpoint
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat({
    api: "/api/chat",
    experimental_prepareRequestBody: ({ messages }) => ({
      messages,
      emotion: selectedEmotion,
      chatId: chatId,
    }),
  });

  // handle getting all previous messages from the db
  const { data: dataMessages } = api.messages.getChatMessages.useQuery(
    chatId ? { chatId: chatId } : skipToken,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: !!chatId,
    },
  );

  // use setMessage to set queried messages into data to be sent to the openai api
  useEffect(() => {
    if (dataMessages) {
      const queriedMessages: Message[] = dataMessages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.messageBy === "USER" ? "user" : "assistant",
      }));
      setMessages(queriedMessages);
    }
  }, [dataMessages, setMessages]);

  // handles selecting an emotion from the dropdown menu, once emotion is set in state, should submit the message
  const handleEmotionSubmit = (emotion: string) => {
    setSelectedEmotion(emotion);
    setShouldSubmit(true);
  };

  // useEffect to handle submitting the message once shouldSubmit is set to true
  useEffect(() => {
    if (shouldSubmit) {
      handleSubmit();
      setShouldSubmit(false);
    }
  }, [shouldSubmit, handleSubmit]);

  return (
    // DIVIDE into components once ui is decided -> components take in heart level as input and return ui accordingly
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-[white] to-[#f7faff] py-12 text-black">
      <div className="flex h-[10%] w-[70%] items-center justify-between space-x-2">
        <div className="flex">
          {isLoadingChat &&
            Array.from({ length: 5 }).map((_, i) => (
              <Heart key={i} className="text-gray-500" />
            ))}
          {isSuccessChat &&
            Array.from({ length: redHeartLevel! }).map((_, i) => (
              <Heart key={i} className="text-red-500" />
            ))}
          {isSuccessChat &&
            Array.from({ length: grayHeartLevel }).map((_, i) => (
              <Heart key={i} className="text-gray-500" />
            ))}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-red-600">{name} 🌹</h2>
          <h3 className="text-center text-xl font-semibold text-red-600">
            {relationship}
          </h3>
        </div>
        <div>
          <UpdateProfile />
        </div>
      </div>
      <ScrollArea className="mx-auto flex h-[500px] w-[70%] min-w-[70%] flex-col space-y-2 overflow-y-auto rounded-md border pb-2">
        {/* placeholder because the UI is not fixed yet */}
        <ChatMessage message="Hello! I'm Wally, your relationship wellness assistant. How can I help you today?" />
        {/* map each message in messages[] to a <ChatMessage> Component */}
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content}
            isUser={message.role === "user"}
          />
        ))}
        {status == "streaming" && <ChatMessage message="..." />}
      </ScrollArea>
      <div className="mx-auto w-[70%] min-w-[70%] p-4">
        <label htmlFor="newMessage" className="sr-only">
          Send a Message
        </label>
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <ShineBorder
            className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl"
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          >
            <textarea
              id="newMessage"
              className="w-full resize-none border-none bg-inherit p-4 focus:outline-none sm:text-sm"
              rows={1}
              placeholder="Send a Message to Wally"
              value={input}
              onChange={handleInputChange}
            ></textarea>
            <div className="flex items-center gap-2 p-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <CircleArrowRight className="text-lg" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Emotions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {emotions.map((e) => {
                    return (
                      <DropdownMenuItem
                        key={e.emotion}
                        onClick={() => {
                          handleEmotionSubmit(e.emotion);
                        }}
                      >
                        {e.emotion}
                        <span>{e.emoji}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  );
}
