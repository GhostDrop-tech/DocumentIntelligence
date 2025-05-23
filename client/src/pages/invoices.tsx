import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, getClients, updateInvoice } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { 
  FileText, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Download 
} from "lucide-react";
import InvoiceDetail from "@/components/invoices/InvoiceDetail";
import InvoiceList from "@/components/invoices/InvoiceList";

export default function Invoices() {
  const [location, setLocation] = useLocation();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    clientId: "",
    status: "",
    search: "",
  });

  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get("id");
    if (invoiceId) {
      setSelectedInvoiceId(parseInt(invoiceId));
    }
  }, [location]);

  return (
    <MainLayout title="Invoice Management">
      {selectedInvoiceId ? (
        <InvoiceDetail 
          invoiceId={selectedInvoiceId} 
          onBack={() => {
            setSelectedInvoiceId(null);
            setLocation("/invoices");
          }}
        />
      ) : (
        <InvoiceList 
          onSelectInvoice={(id) => {
            setSelectedInvoiceId(id);
            setLocation(`/invoices?id=${id}`);
          }}
          filters={filters}
          setFilters={setFilters}
        />
      )}
    </MainLayout>
  );
}
