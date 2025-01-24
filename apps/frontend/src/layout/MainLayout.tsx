import { Navbar } from "../components/navigation/Navbar";
import { Sidebar } from "../components/navigation/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shadow-[0_0px_7px_rgba(0,0,0,0.25)]">
          <Sidebar />
        </div>
        <main className="p-4 overflow-y-auto flex-1">{children}
        </main>
      </div>
    </div>
  );
}
