import { ModelDropdown } from "./model-dropdown";
import { SidebarTrigger } from "@components/ui/sidebar";
import ClerkComponent from "./clerk-component";

export function HeroSection({
  children,
  state,
}: Readonly<{ children: React.ReactNode; state: string }>) {
  const headerStyle =
    state === "collapsed"
      ? "left-0 w-full"
      : "left-[256px] w-[calc(100vw-256px)]";

  return (
    <main style={{ flexGrow: 1 }}>
      <div
        className={`fixed top-0 ${headerStyle} z-10 flex items-center justify-between space-x-4 bg-white p-4 shadow transition-all duration-300`}
      >
        <div className="flex items-center space-x-4">
          {state === "collapsed" && <SidebarTrigger />}
          <ModelDropdown />
        </div>
        <div className="space-x-4">
          <ClerkComponent />
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </main>
  );
}
