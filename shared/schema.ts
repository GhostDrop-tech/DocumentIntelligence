import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // 'invoice' or 'bank_statement'
  originalText: text("original_text"),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, processed, error
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  fileName: true,
  fileType: true,
  originalText: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  clientId: integer("client_id").references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: timestamp("issue_date"),
  dueDate: timestamp("due_date"),
  totalAmount: doublePrecision("total_amount"),
  taxAmount: doublePrecision("tax_amount"),
  currency: text("currency").default("USD"),
  status: text("status").default("unpaid"), // unpaid, paid, overdue
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional extracted data
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, partially_paid, paid
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  documentId: true,
  clientId: true,
  invoiceNumber: true,
  issueDate: true,
  dueDate: true,
  totalAmount: true,
  taxAmount: true,
  currency: true,
  status: true,
  notes: true,
  metadata: true,
  paymentStatus: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  invoiceId: true,
  description: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Bank Statements
export const bankStatements = pgTable("bank_statements", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  statementDate: timestamp("statement_date"),
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  startingBalance: doublePrecision("starting_balance"),
  endingBalance: doublePrecision("ending_balance"),
  currency: text("currency").default("USD"),
  metadata: jsonb("metadata"), // Additional extracted data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBankStatementSchema = createInsertSchema(bankStatements).pick({
  documentId: true,
  statementDate: true,
  accountNumber: true,
  bankName: true,
  startingBalance: true,
  endingBalance: true,
  currency: true,
  metadata: true,
});

export type InsertBankStatement = z.infer<typeof insertBankStatementSchema>;
export type BankStatement = typeof bankStatements.$inferSelect;

// Bank Transactions
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  bankStatementId: integer("bank_statement_id").references(() => bankStatements.id).notNull(),
  date: timestamp("date"),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // debit, credit
  reference: text("reference"),
  senderReceiver: text("sender_receiver"),
  reconciled: boolean("reconciled").default(false),
  reconciledWithInvoiceId: integer("reconciled_with_invoice_id").references(() => invoices.id),
  metadata: jsonb("metadata"), // Additional extracted data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBankTransactionSchema = createInsertSchema(bankTransactions).pick({
  bankStatementId: true,
  date: true,
  description: true,
  amount: true,
  type: true,
  reference: true,
  senderReceiver: true,
  reconciled: true,
  reconciledWithInvoiceId: true,
  metadata: true,
});

export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;

// Define relationships
export const documentsRelations = relations(documents, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [documents.id],
    references: [invoices.documentId],
  }),
  bankStatement: one(bankStatements, {
    fields: [documents.id],
    references: [bankStatements.documentId],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  document: one(documents, {
    fields: [invoices.documentId],
    references: [documents.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  transactions: many(bankTransactions),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const bankStatementsRelations = relations(bankStatements, ({ one, many }) => ({
  document: one(documents, {
    fields: [bankStatements.documentId],
    references: [documents.id],
  }),
  transactions: many(bankTransactions),
}));

export const bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
  bankStatement: one(bankStatements, {
    fields: [bankTransactions.bankStatementId],
    references: [bankStatements.id],
  }),
  reconciledInvoice: one(invoices, {
    fields: [bankTransactions.reconciledWithInvoiceId],
    references: [invoices.id],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));
