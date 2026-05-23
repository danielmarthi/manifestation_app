import { Header } from "../components/Header";
import { LeftNav } from "../components/LeftNav";
import { FutureSelfSidebar } from "../components/FutureSelfSidebar";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftNav />
        <main className="flex-1 min-w-0">{children}</main>
        <FutureSelfSidebar />
      </div>
    </div>
  );
}
