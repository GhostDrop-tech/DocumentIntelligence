import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getTopClients } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

type Client = {
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  invoiceCount: number;
  totalAmount: number;
};

export default function TopClients() {
  const { data: topClients, isLoading, error } = useQuery({
    queryKey: ['/api/clients/top'],
    queryFn: () => getTopClients(5),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate initials from client name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get a consistent color based on client name
  const getColorClass = (name: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-red-100", text: "text-red-700" },
      { bg: "bg-yellow-100", text: "text-yellow-700" },
      { bg: "bg-green-100", text: "text-green-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate percentage for progress bar
  const getPercentage = (amount: number, maxAmount: number) => {
    if (!maxAmount) return 0;
    const percentage = (amount / maxAmount) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Top Clients</h3>
          <Link href="/clients">
            <Button variant="link" className="text-primary p-0">View All</Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {isLoading && (
            <>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-1.5 w-24 mt-1 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          )}
          
          {error && (
            <div className="text-center py-6">
              <p className="text-red-500">Failed to load client data</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}
          
          {topClients && topClients.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No client data available
            </div>
          )}
          
          {topClients && topClients.length > 0 && (
            <>
              {topClients.map((clientData: Client, index: number) => {
                const { client, invoiceCount, totalAmount } = clientData;
                const colorClass = getColorClass(client.name);
                const maxAmount = topClients[0].totalAmount;
                const percentage = getPercentage(totalAmount, maxAmount);
                
                return (
                  <div key={client.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${colorClass.bg} rounded-full flex items-center justify-center ${colorClass.text} font-semibold`}>
                        {getInitials(client.name)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{client.name}</p>
                        <p className="text-xs text-gray-500">{invoiceCount} invoices</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(totalAmount)}</p>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-1.5 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-indigo-500' : index === 2 ? 'bg-purple-500' : index === 3 ? 'bg-red-500' : 'bg-yellow-500'} rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
