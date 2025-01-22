"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ModelDropdown } from "./model-dropdown";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";

export function Header({
  children,
  state,
}: Readonly<{ children: React.ReactNode; state: string }>) {

  const headerStyle =
    state === "collapsed"
      ? "left-0 w-full"
      : "left-[256px] w-[calc(100vw-256px)]";

  return (
    <main style={{ flexGrow: 1 }}>
      {/* Dynamic Header */}
      <div
        className={`fixed top-0 ${headerStyle} bg-white z-10 shadow flex items-center justify-between space-x-4 p-4 transition-all duration-300`}
      >
        <div className="flex items-center space-x-4">
          {state === "collapsed" && <SidebarTrigger />}
          <ModelDropdown />
        </div>
        <div className="space-x-4">
          <SignedOut>
            <SignInButton>
              <Button variant="main">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {

      }
      <div className="mt-4">{children}</div>
    </main>
  );

}
