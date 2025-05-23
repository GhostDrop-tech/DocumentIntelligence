import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, FileText, CreditCard, FileCheck2, Users, Settings, HelpCircle
} from "lucide-react";

type SidebarItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

const SidebarItem = ({ to, icon, label, active }: SidebarItemProps) => {
  return (
    <Link href={to}>
      <a
        className={cn(
          "flex items-center px-4 py-2.5 text-sm font-medium",
          active
            ? "text-primary bg-blue-50 border-l-4 border-primary"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <div className="h-5 w-5 mr-3">{icon}</div>
        {label}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 flex items-center border-b border-gray-200">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold mr-2">
          FD
        </div>
        <h1 className="text-xl font-semibold text-gray-800">FinDocManager</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-3 text-xs text-gray-500 uppercase tracking-wider">
          Main
        </div>
        <SidebarItem
          to="/"
          icon={<Home className="stroke-current" />}
          label="Dashboard"
          active={location === "/" || location === ""}
        />
        <SidebarItem
          to="/invoices"
          icon={<FileText className="stroke-current" />}
          label="Invoices"
          active={location === "/invoices"}
        />
        <SidebarItem
          to="/bank-statements"
          icon={<CreditCard className="stroke-current" />}
          label="Bank Statements"
          active={location === "/bank-statements"}
        />
        <SidebarItem
          to="/reconciliation"
          icon={<FileCheck2 className="stroke-current" />}
          label="Reconciliation"
          active={location === "/reconciliation"}
        />
        <SidebarItem
          to="/clients"
          icon={<Users className="stroke-current" />}
          label="Clients"
          active={location === "/clients"}
        />

        <div className="px-4 mt-6 mb-3 text-xs text-gray-500 uppercase tracking-wider">
          Settings
        </div>
        <SidebarItem
          to="/settings"
          icon={<Settings className="stroke-current" />}
          label="Settings"
          active={location === "/settings"}
        />
        <SidebarItem
          to="/help"
          icon={<HelpCircle className="stroke-current" />}
          label="Help"
          active={location === "/help"}
        />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User profile"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">John Smith</p>
            <p className="text-xs text-gray-500">john@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
