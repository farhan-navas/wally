import { SendMessage } from "~/components/chats/send-message";
// import { auth } from "~/server/auth";
import { auth } from "@clerk/nextjs/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.userId) {
    console.log("User is signed in! home page: ", session.userId);
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col items-center justify-center gap-20 bg-gradient-to-b from-[white] to-[#f7faff] py-12 text-black">
        <h1 className="text-5xl font-bold text-amberTheme">
          Say Hello To Wally!
        </h1>
        <div className="w-[70%]">
          <SendMessage />
        </div>
      </div>
    </HydrateClient>
  );
}
