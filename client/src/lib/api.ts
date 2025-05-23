import { apiRequest } from "./queryClient";

// Document API functions
export const uploadDocument = async (file: File, fileType: 'invoice' | 'bank_statement') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }
  
  return response.json();
};

export const getRecentDocuments = async () => {
  const response = await fetch('/api/documents/recent', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch recent documents: ${errorText}`);
  }
  
  return response.json();
};

// Dashboard API functions
export const getDashboardData = async () => {
  const response = await fetch('/api/dashboard', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch dashboard data: ${errorText}`);
  }
  
  return response.json();
};

// Invoice API functions
export const getInvoices = async (filters?: {
  clientId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  let url = '/api/invoices';
  
  if (filters) {
    const params = new URLSearchParams();
    
    if (filters.clientId) {
      params.append('clientId', filters.clientId.toString());
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch invoices: ${errorText}`);
  }
  
  return response.json();
};

export const getInvoice = async (id: number) => {
  const response = await fetch(`/api/invoices/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch invoice: ${errorText}`);
  }
  
  return response.json();
};

export const updateInvoice = async (id: number, data: any) => {
  return apiRequest('PATCH', `/api/invoices/${id}`, data);
};

// Bank Statement API functions
export const getBankStatements = async () => {
  const response = await fetch('/api/bank-statements', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch bank statements: ${errorText}`);
  }
  
  return response.json();
};

export const getBankStatement = async (id: number) => {
  const response = await fetch(`/api/bank-statements/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch bank statement: ${errorText}`);
  }
  
  return response.json();
};

// Reconciliation API functions
export const getUnreconciledTransactions = async () => {
  const response = await fetch('/api/reconciliation/unreconciled', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch unreconciled transactions: ${errorText}`);
  }
  
  return response.json();
};

export const reconcileTransaction = async (transactionId: number, invoiceId: number) => {
  return apiRequest('POST', '/api/reconciliation/match', { transactionId, invoiceId });
};

// Client API functions
export const getClients = async () => {
  const response = await fetch('/api/clients', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch clients: ${errorText}`);
  }
  
  return response.json();
};

export const getTopClients = async (limit: number = 5) => {
  const response = await fetch(`/api/clients/top?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch top clients: ${errorText}`);
  }
  
  return response.json();
};

export const getClient = async (id: number) => {
  const response = await fetch(`/api/clients/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch client: ${errorText}`);
  }
  
  return response.json();
};

export const createClient = async (data: any) => {
  return apiRequest('POST', '/api/clients', data);
};

export const updateClient = async (id: number, data: any) => {
  return apiRequest('PATCH', `/api/clients/${id}`, data);
};

// Export API functions
export const exportInvoicesToCSV = () => {
  window.open('/api/export/invoices', '_blank');
};
