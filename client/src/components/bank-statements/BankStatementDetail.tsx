import { useQuery } from "@tanstack/react-query";
import { getBankStatement } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, Printer, FileText, Download } from "lucide-react";
import { Link } from "wouter";

interface BankStatementDetailProps {
  statementId: number;
  onBack: () => void;
}

export default function BankStatementDetail({ statementId, onBack }: BankStatementDetailProps) {
  const { data: statement, isLoading } = useQuery({
    queryKey: ['/api/bank-statements', statementId],
    queryFn: () => getBankStatement(statementId),
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

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bank Statements
        </Button>

        {isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {statement?.bankName || 'Bank Statement'} - {formatDate(statement?.statementDate)}
            </h2>
            <div className="space-x-2">
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">{statement?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">{statement?.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statement Date</p>
                    <p className="font-medium">{formatDate(statement?.statementDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{statement?.currency || 'USD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Starting Balance</p>
                    <p className="font-medium">{formatCurrency(statement?.startingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ending Balance</p>
                    <p className="font-medium">{formatCurrency(statement?.endingBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statement?.transactions && statement.transactions.length > 0 ? (
                        statement.transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.reference || 'N/A'}</TableCell>
                            <TableCell className={`text-right ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {transaction.reconciled ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Reconciled</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unreconciled</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                            No transactions available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-4" />

                <div className="space-y-1 text-right">
                  <div className="flex justify-between">
                    <span>Starting Balance:</span>
                    <span>{formatCurrency(statement?.startingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Credits:</span>
                    <span className="text-green-600">
                      +{formatCurrency(
                        statement?.transactions
                          ?.filter(t => t.type === 'credit')
                          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Debits:</span>
                    <span className="text-red-600">
                      -{formatCurrency(
                        statement?.transactions
                          ?.filter(t => t.type === 'debit')
                          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Ending Balance:</span>
                    <span>{formatCurrency(statement?.endingBalance)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statement?.transactions ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Transactions</span>
                        <span className="font-medium">{statement.transactions.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reconciled</span>
                        <span className="font-medium">
                          {statement.transactions.filter(t => t.reconciled).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Unreconciled</span>
                        <span className="font-medium">
                          {statement.transactions.filter(t => !t.reconciled).length}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Reconciliation Rate</span>
                        <span className="font-medium">
                          {statement.transactions.length > 0
                            ? Math.round(
                                (statement.transactions.filter(t => t.reconciled).length / 
                                statement.transactions.length) * 100
                              )
                            : 0}%
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${statement.transactions.length > 0
                              ? (statement.transactions.filter(t => t.reconciled).length / 
                                statement.transactions.length) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      
                      <Link href="/reconciliation">
                        <Button variant="outline" className="w-full mt-2">
                          Go to Reconciliation
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-center text-gray-500">No transaction data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">Original document available</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Original Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
