import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useSetAtom } from "jotai";
import { Button } from "~/components/ui/button";
import { chatDataAtom } from "../atoms";
import { useEffect } from "react";
import { api } from "~/trpc/react";

export default function ClerkComponent() {
  const apiUtils = api.useUtils();

  // this component is used to render the sign in button and user button
  const { user } = useUser();
  const setChatData = useSetAtom(chatDataAtom);

  useEffect(() => {
    if (user === null) {
      sessionStorage.removeItem("wally:chatData");
      setChatData([]);
      void apiUtils.chat.getAllChatHeaders.invalidate(); //invalidate() or cancel() here? adust accordingly
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button variant="main">Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
