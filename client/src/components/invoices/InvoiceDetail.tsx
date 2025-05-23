import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoice, updateInvoice } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  ArrowLeft,
  CalendarIcon, 
  FileText, 
  Edit, 
  Save, 
  X, 
  Check, 
  Printer, 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceDetailProps {
  invoiceId: number;
  onBack: () => void;
}

export default function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    totalAmount: 0,
    notes: "",
  });

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['/api/invoices', invoiceId],
    queryFn: () => getInvoice(invoiceId),
    onSuccess: (data) => {
      setEditData({
        status: data.status || "",
        invoiceNumber: data.invoiceNumber || "",
        issueDate: data.issueDate ? format(new Date(data.issueDate), "yyyy-MM-dd") : "",
        dueDate: data.dueDate ? format(new Date(data.dueDate), "yyyy-MM-dd") : "",
        totalAmount: data.totalAmount || 0,
        notes: data.notes || "",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: (data: any) => updateInvoice(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update invoice: ${error.message}`,
        variant: "destructive",
      });
    },
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
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleSave = () => {
    updateInvoiceMutation.mutate({
      status: editData.status,
      invoiceNumber: editData.invoiceNumber,
      issueDate: editData.issueDate ? new Date(editData.issueDate) : null,
      dueDate: editData.dueDate ? new Date(editData.dueDate) : null,
      totalAmount: parseFloat(editData.totalAmount.toString()),
      notes: editData.notes,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (invoice) {
      setEditData({
        status: invoice.status || "",
        invoiceNumber: invoice.invoiceNumber || "",
        issueDate: invoice.issueDate ? format(new Date(invoice.issueDate), "yyyy-MM-dd") : "",
        dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), "yyyy-MM-dd") : "",
        totalAmount: invoice.totalAmount || 0,
        notes: invoice.notes || "",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    if (status === "overdue") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
  };

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        
        {isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Invoice #{invoice?.invoiceNumber}
              <span className="ml-4">{getStatusBadge(invoice?.status)}</span>
            </h2>
            <div className="space-x-2">
              {!isEditing ? (
                <>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={updateInvoiceMutation.isPending}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateInvoiceMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              )}
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
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      <p className="font-medium">{invoice?.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">{invoice?.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">{formatDate(invoice?.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium">{formatDate(invoice?.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">{formatCurrency(invoice?.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Currency</p>
                      <p className="font-medium">{invoice?.currency || "USD"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-number">Invoice Number</Label>
                      <Input
                        id="invoice-number"
                        value={editData.invoiceNumber}
                        onChange={(e) => setEditData({ ...editData, invoiceNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-date">Issue Date</Label>
                      <Input
                        id="issue-date"
                        type="date"
                        value={editData.issueDate}
                        onChange={(e) => setEditData({ ...editData, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={editData.dueDate}
                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total-amount">Total Amount</Label>
                      <Input
                        id="total-amount"
                        type="number"
                        step="0.01"
                        value={editData.totalAmount}
                        onChange={(e) => setEditData({ ...editData, totalAmount: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input id="currency" value={invoice?.currency || "USD"} disabled />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice?.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No line items available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-4" />

                <div className="space-y-1 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice?.totalAmount)}</span>
                  </div>
                  {invoice?.taxAmount && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice?.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isEditing ? (
              invoice?.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add notes about this invoice..."
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                {invoice?.client ? (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{invoice.client.name}</h3>
                    {invoice.client.email && <p className="text-gray-600">{invoice.client.email}</p>}
                    {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
                    {invoice.client.address && (
                      <p className="text-gray-600 whitespace-pre-line">{invoice.client.address}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No client information available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      invoice?.status === 'paid' ? 'bg-green-500' : 
                      invoice?.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium capitalize">{invoice?.paymentStatus || invoice?.status}</span>
                  </div>
                  
                  {invoice?.status === 'paid' ? (
                    <div className="bg-green-50 p-3 rounded-md border border-green-100">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Payment Received</p>
                          <p className="text-sm text-green-700">
                            This invoice has been paid in full.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : invoice?.status === 'overdue' ? (
                    <div className="bg-red-50 p-3 rounded-md border border-red-100">
                      <div className="flex items-start">
                        <X className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Payment Overdue</p>
                          <p className="text-sm text-red-700">
                            This invoice is past its due date.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Payment Pending</p>
                          <p className="text-sm text-yellow-700">
                            This invoice is awaiting payment.
                          </p>
                        </div>
                      </div>
                    </div>
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
