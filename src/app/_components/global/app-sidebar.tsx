import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@components/ui/sidebar";

import {
  CircleFadingArrowUp,
  CircleUserRound,
  HomeIcon,
  MessageCircle,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

import Link from "next/link";

import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { useAtom } from "jotai";
import { chatDataAtom } from "../atoms";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const state = useAuth();
  const apiUtils = api.useUtils();
  const [chatData, setChatData] = useAtom(chatDataAtom);

  const { data, isLoading } = api.chat.getAllChatHeaders.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (data) => {
      console.log("Chat deleted successfully", data);
      setChatData((prev) => prev.filter((chat) => chat.id !== data.id)); // remove the deleted chat from the chatData atom
      void apiUtils.chat.getAllChatHeaders.invalidate(); // invalidate the query to refetch the chat data in sidebar
    },
    onError: (error) => {
      console.error("Failed to delete chat: ", error);
    },
  });

  const handleDeleteChat = () => {
    if (deletingChatId) {
      deleteChatMutation.mutate({ chatId: deletingChatId });
      setDeletingChatId(null);
    }
  };

  useEffect(() => {
    // set all chatIds and chatData to the atoms, when new data arrives
    if (data && data.length > 0) {
      const chatData = data
        // sort chatData by updatedAt date
        .sort((a, b) => {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        })
        .map(
          ({
            id,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            createdAt,
            updatedAt,
            birthDate,
            race,
            country,
            ...rest
          }) => ({
            id: id,
            chatData: {
              ...rest,
              race: race ?? undefined,
              country: country ?? undefined,
              chatHeader: rest.name,
              birthDate: birthDate
                ? new Date(birthDate).toISOString()
                : undefined,
              updatedAt: new Date(updatedAt).toISOString(),
            },
          }),
        );

      setChatData(chatData);
    }
  }, [data, setChatData]);

  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  return (
    <Sidebar>
      <div className="top-0 flex w-full items-center justify-between p-3">
        {children}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={"/"}>
                  <HomeIcon />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarGroupAction title="New Chat">
              <MessageCircle />
              <span className="sr-only">Start a New Chat!</span>
            </SidebarGroupAction>
            <SidebarMenu>
              {isLoading && (
                <SidebarMenuItem key={"loading"}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              )}
              {chatData.length > 0 &&
                chatData.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/chats/${chat.id}`}>
                        <CircleUserRound />
                        <span>{chat.chatData.chatHeader}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingChatId(chat.id);
                          }}
                        >
                          Delete Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={state.isSignedIn ? "/create-chat" : "/plans"}>
                    <Plus />
                    <span>New Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AlertDialog
        open={!!deletingChatId}
        onOpenChange={(open) => {
          if (!open) setDeletingChatId(null);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogOverlay className="fixed inset-0 bg-black/50 data-[state=closed]:pointer-events-none" />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this chat?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone, and the chat data will be
                permanently deleted!
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteChat}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      <SidebarFooter className="mb-4">
        <SidebarMenu>
          <SidebarMenuItem key="upgrade-plan" className="mx-auto">
            <SidebarMenuButton asChild>
              <Link href="/plans">
                <CircleFadingArrowUp />
                <span>Upgrade plan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
