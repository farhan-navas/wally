"use client";

import { Heart, StopCircle } from "lucide-react";
import { ChatMessage } from "~/app/_components/message/chat-message";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useChat, type Message } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ShineBorder from "@components/ui/shine-border";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@components/ui/dropdown-menu";
import { Button } from "@components/ui/button";
import { toast } from "sonner";

import UpdateProfile from "../profile/update-profile";
import { useAtomValue } from "jotai";
import { useMemoChatData } from "../atoms";
import { marked } from "marked";
import { UploadDropzone } from "~/lib/uploadthing";
import type { Attachment } from "ai";
import Image from "next/image";

interface Emotion {
  emotion: string;
  emoji: string;
}

const emotions: Emotion[] = [
  { emotion: "joyful", emoji: "😊" },
  { emotion: "sad", emoji: "😔" },
  { emotion: "angry", emoji: "😡" },
  { emotion: "fearful", emoji: "😨" },
  { emotion: "disgusted", emoji: "🤢" },
  { emotion: "surprised", emoji: "😲" },
  { emotion: "sarcastic", emoji: "😏" },
  { emotion: "flirty", emoji: "😘" },
  { emotion: "romantic", emoji: "🌹" },
  { emotion: "neutral", emoji: "😐" },
];

const PROFILE_COLORS = ["black", "gold", "orange", "violet", "red"];
const PROFILE_EMOJIS = ["🧊", "👋", "🤝", "🌹", "❤️"];

export default function ChatHome() {
  const router = useRouter();

  // ref object to scroll to the bottom of the chat
  const scrollRef = useRef<HTMLDivElement>(null);

  // ref object to store the uploaded file, only until file is used for a message
  const wallyFileRef = useRef<Attachment | null>(null);

  // object has the same name as the slug in the URL
  const { chats } = useParams();
  const chatId = Array.isArray(chats) ? chats[0] : chats;

  // get profile data from focusedChatDataAtom earlier and set UI
  const focusedChatData = useMemoChatData(chatId!);
  const focusedChat = useAtomValue(focusedChatData);
  const chatData = focusedChat?.chatData;

  const {
    data: queriedChatData,
    isLoading,
    isError,
  } = api.chat.getChat.useQuery(chatId ? { chatId } : skipToken, {
    enabled: !chatData, // only fetch if atom is empty
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isLoading && (isError || (!focusedChat && !queriedChatData))) {
      router.replace("/");
      toast.error(`Unable to load conversation ${chatId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedChat, queriedChatData, isError, isLoading, router]);

  const redHeartLevel = chatData?.heartLevel ?? queriedChatData?.heartLevel;
  const relationship = chatData?.relationship ?? queriedChatData?.relationship;
  const name = chatData?.name ?? queriedChatData?.name;
  const grayHeartLevel = redHeartLevel ? 5 - redHeartLevel : 0;
  const profileColor = PROFILE_COLORS[redHeartLevel - 1];
  const profileEmoji = PROFILE_EMOJIS[redHeartLevel - 1];

  // set state of the currently selected emotion (useState to display on frontend in future)
  const [selectedEmotion, setSelectedEmotion] = useState("");
  // handle openai api call
  const [shouldSubmit, setShouldSubmit] = useState(false);

  // saveMessageMutation
  const saveMessageMutation = api.messages.saveMessage.useMutation({
    onSuccess: () => {
      console.log("Message saved to db successfully");
    },
    onError: (error) => {
      console.error("Error saving message: ", error);
    },
  });

  // handle getting all previous messages from the db (useQuery())
  const { data: dataMessages } = api.messages.getChatMessages.useQuery(
    chatId ? { chatId: chatId } : skipToken,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: !!chatId,
    },
  );

  // try getting all previous messages from the db using a subscription (useSubscription())
  // const { data: dataMessages } = api.messages.getChatMessages.useSubscription(
  //   chatId ? { chatId: chatId } : skipToken,
  //   {
  //     onData: (msg) => {
  //       setMessages((prevMsgs) => [
  //         {
  //           id: msg.id,
  //           content: msg.content,
  //           role: msg.messageBy === "USER" ? "user" : "assistant",
  //           experimental_attachments: msg.files.length
  //             ? (msg.files as Attachment[])
  //             : undefined,
  //         },
  //         ...prevMsgs,
  //       ]);
  //       console.log("Received new message:", msg);
  //     },
  //   },
  // );

  // useChat() hook sends a HTTP POST request to /api/chat endpoint
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    reload,
  } = useChat({
    api: "/api/chat",
    experimental_prepareRequestBody: ({ messages }) => ({
      messages,
      emotion: selectedEmotion,
      chatId: chatId,
      // profileData: dataChat,
      profileData: chatData,
    }),
    onFinish: (assistantMessage, { usage, finishReason }) => {
      // for logging and debugging purposes
      // console.log("Finished streaming message:", assistantMessage);
      console.log("Token usage:", usage);
      console.log("Finish reason:", finishReason);

      // try saving assistant message to db
      try {
        void saveMessageMutation.mutate({
          chatId: chatId!,
          content: assistantMessage.content,
          messageBy: "WALLY",
        });

        console.log("Finished saving assistant message: ", assistantMessage);
      } catch (error) {
        console.error("Error saving assistant message:", error);
      }
    },
    onResponse: (response) => {
      console.log("Received HTTP response from server:", response);
    },
    onError: (error) => {
      toast.error("An error occurred, ", {
        description: error.name,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        action: { label: "Retry", onClick: () => reload() },
      });
    },
  });

  // scroll to the bottom of the chat when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scrollRef, messages]);

  // use setMessage to set queried messages into data to be sent to the openai api
  useEffect(() => {
    if (dataMessages) {
      const queriedMessages: Message[] = dataMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.messageBy === "USER" ? "user" : "assistant",
        experimental_attachments: msg.files.length
          ? (msg.files as Attachment[])
          : undefined,
      }));

      setMessages(queriedMessages.reverse());
    }
  }, [dataMessages, setMessages]);

  // handles selecting an emotion from the dropdown menu, once emotion is set in state, should submit the message
  // once message is ready to be submitted, save that message to the db
  const handleEmotionSubmit = (emotion: string) => {
    setSelectedEmotion(emotion);
    setShouldSubmit(true);
  };

  // useEffect to handle submitting the message once shouldSubmit is set to true
  useEffect(() => {
    if (shouldSubmit && chatId && input) {
      const userMessage = input;

      // file to be saved to db if it exists
      const file = wallyFileRef.current;

      // try saving user message to db before calling handleSubmit()
      void saveMessageMutation.mutate({
        chatId: chatId,
        content: userMessage,
        messageBy: "USER",
        files: file ? [file] : [],
      });

      console.log("Finished saving user message: ", userMessage);

      // pass the file to the handleSubmit function
      handleSubmit(undefined, {
        experimental_attachments: file ? [file] : undefined,
      });

      // reset file ref and set shouldSubmit to false
      wallyFileRef.current = null;
      setShouldSubmit(false);
    }
  }, [shouldSubmit, handleSubmit, chatId, input, saveMessageMutation]);

  return (
    // DIVIDE into components once ui is decided -> components take in heart level as input and return ui accordingly
    <div className="flex min-h-[80vh] min-w-[65vw] flex-col items-center justify-between gap-10 bg-gradient-to-b from-[white] to-[#f7faff] py-12 text-black">
      <div className="flex h-[10%] w-[80%] items-center justify-between space-x-2">
        <div className="flex">
          {Array.from({ length: redHeartLevel }).map((_, i) => (
            <Heart key={i} style={{ color: profileColor }} />
          ))}
          {Array.from({ length: grayHeartLevel }).map((_, i) => (
            <Heart key={i} className="text-gray-500" />
          ))}
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: profileColor }}>
            {name} {profileEmoji}
          </h2>
          <h3
            className="text-center text-xl font-semibold"
            style={{ color: profileColor }}
          >
            {relationship}
          </h3>
        </div>
        <div>
          <UpdateProfile />
        </div>
      </div>
      <ScrollArea className="mx-auto flex h-[500px] w-[65vw] min-w-[65vw] flex-col space-y-2 overflow-y-auto rounded-md border">
        {/* map each message in messages[] to a <ChatMessage> Component */}
        {messages.map((message, mi) => (
          <ChatMessage key={mi} isUser={message.role === "user"}>
            {message.experimental_attachments
              ?.filter((att) => att.contentType?.startsWith("image/"))
              .map((att, ai) => (
                <Image
                  key={`${mi}-${ai}`}
                  src={att.url}
                  alt={att?.name ?? "image"}
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              ))}
            <div
              key={mi}
              className="prose max-w-full whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: marked(message.content ?? ""),
              }}
            ></div>
            <div ref={scrollRef} />
          </ChatMessage>
        ))}
        {/* {status == "streaming" && <ChatMessage>...</ChatMessage>} */}
      </ScrollArea>
      <div className="mx-auto flex w-[65vw] flex-col gap-0">
        <UploadDropzone
          className="relative m-0 max-h-[30px] w-full overflow-visible rounded-b-none border-b-0 bg-gray-100/50 p-0 ut-allowed-content:hidden ut-label:text-amberTheme ut-uploading:ut-label:text-amberTheme-darker"
          endpoint="imageUploader"
          config={{
            mode: "auto",
          }}
          onClientUploadComplete={(res) => {
            // Do something with the response
            console.log("File: ", res);
            console.log("File URL: ", res[0]?.ufsUrl);
            wallyFileRef.current = {
              name: res[0]?.name ?? "",
              url: res[0]?.ufsUrl ?? "",
              contentType: res[0]?.type ?? "",
            };
            console.log("Image file wally: ", wallyFileRef.current);
            console.log("Image url:", wallyFileRef.current?.url);
            toast.success("Image uploaded successfully");
          }}
          onUploadError={(error: Error) => {
            // Do something with the error
            console.log("Error uploading image: ", error);
            toast.error("Error uploading image");
          }}
        />
        <label htmlFor="newMessage" className="sr-only">
          Send a Message
        </label>
        <div className="flex items-center overflow-hidden rounded-b-lg rounded-t-none border border-t-0 border-gray-200 shadow-sm">
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
              {(status === "submitted" || status === "streaming") && (
                <Button onClick={stop} variant="main">
                  <StopCircle />
                </Button>
              )}
              {status === "ready" && (
                <>
                  {/* <UploadButton
                    className="ut-button:bg-amberTheme ut-button:ut-readying:bg-amberTheme/50 ut-button:ut-uploading:bg-amberTheme/50"
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      console.log("Files: ", res);
                      toast.success("Image uploaded successfully");
                    }}
                    onUploadError={(error: Error) => {
                      console.log("Error uploading image: ", error);
                      toast.error("Error uploading image");
                    }}
                  /> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="main" className="text-md h-11">
                        Send
                      </Button>
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
                </>
              )}
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  );
}
