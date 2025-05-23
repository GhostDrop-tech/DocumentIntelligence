import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Search, Bell } from "lucide-react";

type MainLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <MobileNav />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="md:hidden">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">FD</div>
          </div>
          <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-48 pl-8 pr-4 py-2 text-sm border rounded-md focus:ring-primary focus:border-primary" 
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <button className="p-2 text-gray-600 hover:text-primary">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 bg-gray-50 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
