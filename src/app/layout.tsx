import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import Home from "~/app/_components/global/home";

import { SidebarProvider } from "@components/ui/sidebar";
import { Toaster } from "sonner";
import JotaiProvider from "./_components/jotai-provider";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { HighlightInit } from "@highlight-run/next/client";

export const metadata: Metadata = {
  title: "Wally",
  description:
    "Wally is your personal AI relationship wellness assistant that offers offline communication tips to strengthen bonds and nurture healthier connections.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <HighlightInit
            projectId={"ve6yz9zg"}
            serviceName="my-nextjs-frontend"
            tracingOrigins
            networkRecording={{
              enabled: true,
              recordHeadersAndBody: true,
              urlBlocklist: [],
            }}
          />
          <TRPCReactProvider>
            <JotaiProvider>
              <SidebarProvider>
                <Home>{children}</Home>
              </SidebarProvider>
            </JotaiProvider>
          </TRPCReactProvider>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
