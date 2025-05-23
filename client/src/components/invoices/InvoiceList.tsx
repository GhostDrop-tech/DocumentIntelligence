import { useQuery } from "@tanstack/react-query";
import { getInvoices, getClients, exportInvoicesToCSV } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye 
} from "lucide-react";
import { format } from "date-fns";

interface InvoiceListProps {
  onSelectInvoice: (id: number) => void;
  filters: {
    clientId: string;
    status: string;
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    clientId: string;
    status: string;
    search: string;
  }>>;
}

export default function InvoiceList({ onSelectInvoice, filters, setFilters }: InvoiceListProps) {
  const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['/api/invoices', filters.clientId, filters.status],
    queryFn: () => getInvoices({
      ...(filters.clientId ? { clientId: parseInt(filters.clientId) } : {}),
      ...(filters.status ? { status: filters.status } : {})
    }),
  });

  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: () => getClients(),
  });

  const handleExportCSV = () => {
    exportInvoicesToCSV();
  };

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

  // Filter invoices based on search term
  const filteredInvoices = invoices?.filter(invoice => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    return (
      (invoice.invoiceNumber?.toLowerCase().includes(searchLower)) ||
      (invoice.client?.name?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Invoices</CardTitle>
          <div className="flex space-x-2">
            <Button className="bg-primary text-white" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={filters.clientId}
                onValueChange={(value) => setFilters({ ...filters, clientId: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  {!isClientsLoading && clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInvoicesLoading && (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-9 w-9 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                {!isInvoicesLoading && filteredInvoices?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
                {!isInvoicesLoading && filteredInvoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-primary">
                      #{invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.client?.name || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800 hover:bg-red-100'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        }
                      >
                        {invoice.status === 'paid'
                          ? 'Paid'
                          : invoice.status === 'overdue'
                          ? 'Overdue'
                          : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectInvoice(invoice.id)}
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
    </>
  );
}
