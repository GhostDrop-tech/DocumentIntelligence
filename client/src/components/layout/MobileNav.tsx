import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, FileText, CreditCard, Settings } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex items-center justify-around py-3">
      <Link href="/">
        <a className={cn("flex flex-col items-center justify-center", location === "/" ? "text-primary" : "text-gray-600")}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      
      <Link href="/invoices">
        <a className={cn("flex flex-col items-center justify-center", location === "/invoices" ? "text-primary" : "text-gray-600")}>
          <FileText className="h-6 w-6" />
          <span className="text-xs mt-1">Invoices</span>
        </a>
      </Link>
      
      <Link href="/bank-statements">
        <a className={cn("flex flex-col items-center justify-center", location === "/bank-statements" ? "text-primary" : "text-gray-600")}>
          <CreditCard className="h-6 w-6" />
          <span className="text-xs mt-1">Bank</span>
        </a>
      </Link>
      
      <Link href="/settings">
        <a className={cn("flex flex-col items-center justify-center", location === "/settings" ? "text-primary" : "text-gray-600")}>
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </a>
      </Link>
    </div>
  );
}
