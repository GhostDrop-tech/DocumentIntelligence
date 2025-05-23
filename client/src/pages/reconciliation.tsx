import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUnreconciledTransactions, getInvoices, reconcileTransaction } from "@/lib/api";
import ReconciliationList from "@/components/reconciliation/ReconciliationList";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Reconciliation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // Parse query params for pre-selected transaction
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction");
    if (transactionId) {
      setSelectedTransactionId(parseInt(transactionId));
    }
  }, [location]);

  const title = "Reconciliation";
  
  return (
    <MainLayout title={title}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Invoice & Bank Statement Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Match your bank transactions to invoices to keep track of payments. Unmatched transactions
            are shown below.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Matched</span>
            <div className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></div>
            <span className="text-sm font-medium text-gray-700">Partially Matched</span>
            <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
            <span className="text-sm font-medium text-gray-700">Unmatched</span>
          </div>
        </CardContent>
      </Card>

      <ReconciliationList 
        selectedTransactionId={selectedTransactionId}
        onSelectTransaction={setSelectedTransactionId}
      />
    </MainLayout>
  );
}
