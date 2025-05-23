import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getUnreconciledTransactions } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReconciliationStatus() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: () => getDashboardData(),
  });

  const { data: unreconciledTransactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/reconciliation/unreconciled'],
    queryFn: () => getUnreconciledTransactions(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isLoading = isDashboardLoading || isTransactionsLoading;
  const reconciliationPercentage = dashboardData?.kpis?.reconciliationPercentage || 0;

  const getReconciliationStats = () => {
    const totalTransactions = Math.round((unreconciledTransactions?.length || 0) / (1 - reconciliationPercentage / 100));
    const matchedCount = Math.round(totalTransactions * (reconciliationPercentage / 100));
    const pendingCount = Math.min(5, Math.round(totalTransactions * 0.1)); // Arbitrary calculation
    const unmatchedCount = unreconciledTransactions?.length || 0;
    
    return { matchedCount, pendingCount, unmatchedCount };
  };

  const stats = getReconciliationStats();

  return (
    <Card className="bg-white shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Reconciliation Status</h3>
          <Link href="/reconciliation">
            <Button variant="link" className="text-primary p-0">View Details</Button>
          </Link>
        </div>
      </div>
      
      <CardContent className="p-5">
        {isLoading ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="h-5 w-40 mb-3" />
            {[1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-20 w-full mb-3 rounded-md" />
            ))}
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">{stats.matchedCount}</div>
                <div className="text-sm text-gray-500">Matched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-yellow-600">{stats.pendingCount}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600">{stats.unmatchedCount}</div>
                <div className="text-sm text-gray-500">Unmatched</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(reconciliationPercentage)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${reconciliationPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-gray-700 mb-3">Unmatched Transactions</h4>
            <div className="space-y-3">
              {unreconciledTransactions && unreconciledTransactions.length > 0 ? (
                unreconciledTransactions.slice(0, 3).map((transaction, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-md border border-red-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.date ? formatDate(transaction.date) : 'Unknown date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                        <Link href={`/reconciliation?transaction=${transaction.id}`}>
                          <Button variant="link" className="text-xs text-primary p-0">Match manually</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No unmatched transactions found
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
