import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnreconciledTransactions, getInvoices, reconcileTransaction } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { Search, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReconciliationListProps {
  selectedTransactionId: number | null;
  onSelectTransaction: (id: number | null) => void;
}

export default function ReconciliationList({ selectedTransactionId, onSelectTransaction }: ReconciliationListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/reconciliation/unreconciled'],
    queryFn: () => getUnreconciledTransactions(),
  });

  const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['/api/invoices', 'unpaid'],
    queryFn: () => getInvoices({ status: 'unpaid' }),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ transactionId, invoiceId }: { transactionId: number, invoiceId: number }) => 
      reconcileTransaction(transactionId, invoiceId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction successfully reconciled with invoice",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reconciliation/unreconciled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setIsMatchDialogOpen(false);
      setSelectedInvoiceId(null);
      onSelectTransaction(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reconcile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Find the selected transaction
  const selectedTransaction = transactions?.find(t => t.id === selectedTransactionId);

  // Filter transactions based on search term
  const filteredTransactions = transactions?.filter(transaction => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (transaction.description?.toLowerCase().includes(searchLower)) ||
      (transaction.reference?.toLowerCase().includes(searchLower)) ||
      (transaction.senderReceiver?.toLowerCase().includes(searchLower))
    );
  });

  // Suggest invoices that are close to the transaction amount
  const suggestedInvoices = selectedTransaction && invoices
    ? invoices
      .filter(invoice => !invoice.paymentStatus || invoice.paymentStatus === 'unpaid')
      .filter(invoice => {
        const transactionAmount = selectedTransaction.amount || 0;
        const invoiceAmount = invoice.totalAmount || 0;
        // Match if the amounts are within 1% of each other
        const percentDiff = Math.abs((transactionAmount - invoiceAmount) / invoiceAmount) * 100;
        return percentDiff < 1;
      })
    : [];

  const handleMatch = (transactionId: number) => {
    onSelectTransaction(transactionId);
    setIsMatchDialogOpen(true);
  };

  const handleReconcileConfirm = () => {
    if (selectedTransactionId && selectedInvoiceId) {
      reconcileMutation.mutate({
        transactionId: selectedTransactionId,
        invoiceId: selectedInvoiceId
      });
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Sender/Receiver</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading && (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                {!isTransactionsLoading && filteredTransactions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No unreconciled transactions found
                    </TableCell>
                  </TableRow>
                )}
                {!isTransactionsLoading && filteredTransactions?.map((transaction) => (
                  <TableRow key={transaction.id} className={selectedTransactionId === transaction.id ? "bg-blue-50" : ""}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || 'N/A'}</TableCell>
                    <TableCell>{transaction.senderReceiver || 'N/A'}</TableCell>
                    <TableCell className={`text-right ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleMatch(transaction.id)}
                      >
                        Match
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Match Transaction to Invoice</DialogTitle>
            <DialogDescription>
              Select an invoice to match with this bank transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="py-4">
              <h3 className="text-sm font-medium mb-2">Transaction Details</h3>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm">{selectedTransaction.description}</p>
                  </div>
                  {selectedTransaction.reference && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Reference</p>
                      <p className="text-sm">{selectedTransaction.reference}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {suggestedInvoices.length > 0 && (
                <div className="mb-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Suggested Matches</AlertTitle>
                    <AlertDescription>
                      We've found {suggestedInvoices.length} invoice(s) with similar amounts.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Invoice</label>
                  <Select
                    value={selectedInvoiceId?.toString() || ""}
                    onValueChange={(value) => setSelectedInvoiceId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {isInvoicesLoading ? (
                        <div className="p-2">Loading invoices...</div>
                      ) : invoices?.length === 0 ? (
                        <div className="p-2">No unpaid invoices available</div>
                      ) : (
                        <>
                          {suggestedInvoices.length > 0 && (
                            <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                              Suggested Matches
                            </div>
                          )}
                          {suggestedInvoices.map((invoice) => (
                            <SelectItem 
                              key={`suggested-${invoice.id}`} 
                              value={invoice.id.toString()}
                              className="text-green-600 font-medium"
                            >
                              #{invoice.invoiceNumber} - {formatCurrency(invoice.totalAmount)}
                            </SelectItem>
                          ))}
                          
                          {suggestedInvoices.length > 0 && invoices && (
                            <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                              All Unpaid Invoices
                            </div>
                          )}
                          
                          {invoices
                            ?.filter(inv => !suggestedInvoices.some(si => si.id === inv.id))
                            .filter(inv => !inv.paymentStatus || inv.paymentStatus === 'unpaid')
                            .map((invoice) => (
                              <SelectItem 
                                key={invoice.id} 
                                value={invoice.id.toString()}
                              >
                                #{invoice.invoiceNumber} - {formatCurrency(invoice.totalAmount)}
                              </SelectItem>
                            ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsMatchDialogOpen(false);
                setSelectedInvoiceId(null);
                onSelectTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReconcileConfirm}
              disabled={!selectedInvoiceId || reconcileMutation.isPending}
            >
              {reconcileMutation.isPending ? "Reconciling..." : "Reconcile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
