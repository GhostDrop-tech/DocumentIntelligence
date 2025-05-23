import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  documents, type Document, type InsertDocument,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem,
  bankStatements, type BankStatement, type InsertBankStatement,
  bankTransactions, type BankTransaction, type InsertBankTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, gte, lte } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User methods (keeping for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocumentStatus(id: number, status: string, error?: string): Promise<Document>;
  getDocuments(limit?: number): Promise<Document[]>;
  
  // Client methods
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByName(name: string): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoices(filters?: { clientId?: number, status?: string, startDate?: Date, endDate?: Date }): Promise<Invoice[]>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  getRecentInvoices(limit?: number): Promise<Invoice[]>;
  
  // Invoice Item methods
  createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  // Bank Statement methods
  createBankStatement(bankStatement: InsertBankStatement): Promise<BankStatement>;
  getBankStatement(id: number): Promise<BankStatement | undefined>;
  getBankStatements(): Promise<BankStatement[]>;
  
  // Bank Transaction methods
  createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction>;
  getBankTransactions(bankStatementId: number): Promise<BankTransaction[]>;
  getUnreconciledTransactions(): Promise<BankTransaction[]>;
  reconcileTransaction(id: number, invoiceId: number): Promise<BankTransaction>;
  
  // Dashboard methods
  getTotalRevenue(): Promise<number>;
  getUnpaidInvoicesTotal(): Promise<number>;
  getTotalClients(): Promise<number>;
  getReconciliationPercentage(): Promise<number>;
  getTopClients(limit?: number): Promise<{ client: Client, invoiceCount: number, totalAmount: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Document methods
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values({
        ...document,
        processingStatus: 'pending'
      })
      .returning();
    return newDocument;
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }
  
  async updateDocumentStatus(id: number, status: string, error?: string): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({
        processingStatus: status,
        processingError: error,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }
  
  async getDocuments(limit: number = 10): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }
  
  // Client methods
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client;
  }
  
  async getClientByName(name: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.name, name));
    return client;
  }
  
  async getClients(): Promise<Client[]> {
    return db
      .select()
      .from(clients)
      .orderBy(clients.name);
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }
  
  // Invoice methods
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }
  
  async getInvoices(filters?: { clientId?: number, status?: string, startDate?: Date, endDate?: Date }): Promise<Invoice[]> {
    let query = db.select().from(invoices);
    
    if (filters) {
      if (filters.clientId) {
        query = query.where(eq(invoices.clientId, filters.clientId));
      }
      
      if (filters.status) {
        query = query.where(eq(invoices.status, filters.status));
      }
      
      if (filters.startDate) {
        query = query.where(gte(invoices.issueDate, filters.startDate));
      }
      
      if (filters.endDate) {
        query = query.where(lte(invoices.issueDate, filters.endDate));
      }
    }
    
    return query.orderBy(desc(invoices.issueDate));
  }
  
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        ...invoice,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }
  
  async getRecentInvoices(limit: number = 5): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(limit);
  }
  
  // Invoice Item methods
  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db
      .insert(invoiceItems)
      .values(invoiceItem)
      .returning();
    return newItem;
  }
  
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }
  
  // Bank Statement methods
  async createBankStatement(bankStatement: InsertBankStatement): Promise<BankStatement> {
    const [newStatement] = await db
      .insert(bankStatements)
      .values(bankStatement)
      .returning();
    return newStatement;
  }
  
  async getBankStatement(id: number): Promise<BankStatement | undefined> {
    const [statement] = await db
      .select()
      .from(bankStatements)
      .where(eq(bankStatements.id, id));
    return statement;
  }
  
  async getBankStatements(): Promise<BankStatement[]> {
    return db
      .select()
      .from(bankStatements)
      .orderBy(desc(bankStatements.statementDate));
  }
  
  // Bank Transaction methods
  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction> {
    const [newTransaction] = await db
      .insert(bankTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
  
  async getBankTransactions(bankStatementId: number): Promise<BankTransaction[]> {
    return db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.bankStatementId, bankStatementId))
      .orderBy(desc(bankTransactions.date));
  }
  
  async getUnreconciledTransactions(): Promise<BankTransaction[]> {
    return db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.reconciled, false))
      .orderBy(desc(bankTransactions.date));
  }
  
  async reconcileTransaction(id: number, invoiceId: number): Promise<BankTransaction> {
    const [transaction] = await db
      .update(bankTransactions)
      .set({
        reconciled: true,
        reconciledWithInvoiceId: invoiceId
      })
      .where(eq(bankTransactions.id, id))
      .returning();
    return transaction;
  }
  
  // Dashboard methods
  async getTotalRevenue(): Promise<number> {
    const result = await db
      .select({ totalRevenue: sql`SUM(${invoices.totalAmount})` })
      .from(invoices);
    
    return result[0]?.totalRevenue || 0;
  }
  
  async getUnpaidInvoicesTotal(): Promise<number> {
    const result = await db
      .select({ totalUnpaid: sql`SUM(${invoices.totalAmount})` })
      .from(invoices)
      .where(eq(invoices.status, 'unpaid'));
    
    return result[0]?.totalUnpaid || 0;
  }
  
  async getTotalClients(): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(clients);
    
    return result[0]?.count || 0;
  }
  
  async getReconciliationPercentage(): Promise<number> {
    const allTransactions = await db
      .select({ count: sql`COUNT(*)` })
      .from(bankTransactions);
    
    const reconciledTransactions = await db
      .select({ count: sql`COUNT(*)` })
      .from(bankTransactions)
      .where(eq(bankTransactions.reconciled, true));
    
    const total = allTransactions[0]?.count || 0;
    const reconciled = reconciledTransactions[0]?.count || 0;
    
    return total > 0 ? (reconciled / total) * 100 : 0;
  }
  
  async getTopClients(limit: number = 5): Promise<{ client: Client, invoiceCount: number, totalAmount: number }[]> {
    const clientsWithTotals = await db
      .select({
        clientId: clients.id,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        clientAddress: clients.address,
        invoiceCount: sql<number>`COUNT(${invoices.id})`,
        totalAmount: sql<number>`SUM(${invoices.totalAmount})`
      })
      .from(clients)
      .leftJoin(invoices, eq(clients.id, invoices.clientId))
      .groupBy(clients.id, clients.name, clients.email, clients.phone, clients.address)
      .orderBy(desc(sql`SUM(${invoices.totalAmount})`))
      .limit(limit);
    
    return clientsWithTotals.map(row => ({
      client: {
        id: row.clientId,
        name: row.clientName,
        email: row.clientEmail,
        phone: row.clientPhone,
        address: row.clientAddress,
        createdAt: new Date() // This is just a placeholder since we don't have it in the query
      },
      invoiceCount: row.invoiceCount,
      totalAmount: row.totalAmount || 0
    }));
  }
}

export const storage = new DatabaseStorage();
