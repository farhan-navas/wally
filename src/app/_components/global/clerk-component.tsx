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

import { H } from "@highlight-run/next/client";

export default function ClerkComponent() {
  // this component is used to render the sign in button and user button
  const { user } = useUser();
  const setChatData = useSetAtom(chatDataAtom);

  useEffect(() => {
    if (user === null) {
      sessionStorage.removeItem("wally:chatData");
      setChatData([]);
    }

    let userId = String(crypto.randomUUID());
    let fullName = "Anon User";
    let emailId = "anonymous";
    let email = "anon@anonymous.com";
    let hasSignedIn = false;

    if (user) {
      userId = user.id;
      fullName = user.firstName + " " + user.lastName;
      emailId = user.primaryEmailAddressId ?? "";
      email =
        user.emailAddresses.find((email) => email.id === emailId)
          ?.emailAddress ?? "";
      hasSignedIn = true;
    }

    H.identify(userId, {
      highlightDisplayName: fullName,
      highlighEmail: email,
      hasUsedFeature: hasSignedIn,
    });

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
