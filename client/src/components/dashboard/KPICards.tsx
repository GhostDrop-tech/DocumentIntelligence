import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, Clock, Users, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";

type KPICardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label: string;
  };
};

const KPICard = ({ title, value, icon, iconBgColor, iconColor, trend }: KPICardProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", iconBgColor)}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center mt-3">
            <span 
              className={cn(
                "flex items-center text-sm font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {trend.value}
            </span>
            <span className="text-gray-500 text-sm ml-2">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type KPICardsProps = {
  totalRevenue: number;
  unpaidInvoicesTotal: number;
  totalClients: number;
  reconciliationPercentage: number;
};

export default function KPICards({ 
  totalRevenue, 
  unpaidInvoicesTotal, 
  totalClients, 
  reconciliationPercentage 
}: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-3">Financial Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          trend={{ value: "12.5%", isPositive: true, label: "vs. last month" }}
        />
        
        <KPICard
          title="Unpaid Invoices"
          value={formatCurrency(unpaidInvoicesTotal)}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          trend={{ value: "3.2%", isPositive: false, label: "vs. last month" }}
        />
        
        <KPICard
          title="Total Clients"
          value={totalClients}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          trend={{ value: "4 new", isPositive: true, label: "this month" }}
        />
        
        <KPICard
          title="Reconciled"
          value={`${Math.round(reconciliationPercentage)}%`}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          trend={{ value: "8.1%", isPositive: true, label: "vs. last month" }}
        />
      </div>
    </div>
  );
}
