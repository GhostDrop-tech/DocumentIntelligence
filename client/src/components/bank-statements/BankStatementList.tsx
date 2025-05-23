import { useQuery } from "@tanstack/react-query";
import { getBankStatements } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Search, Eye, FileText, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface BankStatementListProps {
  onSelectStatement: (id: number) => void;
}

export default function BankStatementList({ onSelectStatement }: BankStatementListProps) {
  const [search, setSearch] = useState("");
  
  const { data: bankStatements, isLoading } = useQuery({
    queryKey: ['/api/bank-statements'],
    queryFn: () => getBankStatements(),
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

  // Filter statements based on search term
  const filteredStatements = bankStatements?.filter(statement => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (statement.bankName?.toLowerCase().includes(searchLower)) ||
      (statement.accountNumber?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Bank Statements</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bank statements..."
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
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Statement Date</TableHead>
                <TableHead>Starting Balance</TableHead>
                <TableHead>Ending Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-9 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!isLoading && filteredStatements?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No bank statements found
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredStatements?.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell>{statement.bankName || 'Unknown Bank'}</TableCell>
                  <TableCell>{statement.accountNumber || 'N/A'}</TableCell>
                  <TableCell>{formatDate(statement.statementDate)}</TableCell>
                  <TableCell>{formatCurrency(statement.startingBalance)}</TableCell>
                  <TableCell>{formatCurrency(statement.endingBalance)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectStatement(statement.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
