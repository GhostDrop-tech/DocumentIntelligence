import { db } from './db';
import { clients, documents, invoices, invoiceItems, bankStatements, bankTransactions } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * This script seeds the database with sample data for testing the dashboard.
 * Run it with: npx tsx server/seedDatabase.ts
 */
async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  // 1. Add sample clients
  const clientsData = [
    { name: 'Acme Corporation', email: 'billing@acme.com', phone: '555-123-4567', address: '123 Main St, Business City, 12345' },
    { name: 'TechStart Inc.', email: 'accounts@techstart.io', phone: '555-987-6543', address: '456 Innovation Dr, Tech Valley, 67890' },
    { name: 'Global Retail Ltd', email: 'finance@globalretail.com', phone: '555-456-7890', address: '789 Market Ave, Commerce City, 34567' },
    { name: 'Creative Agency Co.', email: 'billing@creative.co', phone: '555-234-5678', address: '321 Design Blvd, Creative Quarter, 89012' },
    { name: 'Food Service Partners', email: 'accounts@foodservice.net', phone: '555-345-6789', address: '567 Culinary St, Flavor Town, 45678' }
  ];

  console.log('Adding clients...');
  const createdClients = await Promise.all(
    clientsData.map(client => db.insert(clients).values(client).returning())
  );
  const flatClients = createdClients.flat();
  console.log(`Added ${flatClients.length} clients`);

  // 2. Add sample documents, invoices and invoice items
  console.log('Adding invoices and documents...');
  
  // For each client, create 1-3 invoices
  for (const client of flatClients) {
    const invoiceCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < invoiceCount; i++) {
      // First create a document for this invoice
      const invoiceNumber = `INV-${client.id}-${2023}-${i + 1}`;
      const issueDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Random invoice amount between $500 and $5000
      const totalAmount = parseFloat((Math.random() * 4500 + 500).toFixed(2));
      const taxAmount = parseFloat((totalAmount * 0.1).toFixed(2));
      
      // Create document
      const docSampleText = `Invoice #${invoiceNumber}
Date: ${issueDate.toISOString().split('T')[0]}
Client: ${client.name}
Amount: $${totalAmount.toFixed(2)}
Tax: $${taxAmount.toFixed(2)}
Due: ${dueDate.toISOString().split('T')[0]}`;
      
      const [document] = await db.insert(documents).values({
        fileName: `Invoice_${invoiceNumber}.pdf`,
        fileType: 'invoice',
        originalText: docSampleText,
        processingStatus: 'processed'
      }).returning();
      
      // Create invoice
      const [invoice] = await db.insert(invoices).values({
        documentId: document.id,
        clientId: client.id,
        invoiceNumber,
        issueDate,
        dueDate,
        totalAmount,
        taxAmount,
        currency: 'USD',
        status: Math.random() > 0.3 ? 'paid' : 'unpaid',
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'unpaid',
        notes: 'Sample invoice created for dashboard demonstration',
        metadata: {}
      }).returning();
      
      // Create 1-5 invoice items
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const itemsTotal = totalAmount - taxAmount;
      let remainingAmount = itemsTotal;
      
      for (let j = 0; j < itemCount; j++) {
        const isLastItem = j === itemCount - 1;
        let itemAmount;
        
        if (isLastItem) {
          itemAmount = remainingAmount;
        } else {
          // Random distribution of the total among items
          itemAmount = parseFloat((remainingAmount * (Math.random() * 0.5 + 0.1)).toFixed(2));
          remainingAmount -= itemAmount;
        }
        
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = parseFloat((itemAmount / quantity).toFixed(2));
        
        await db.insert(invoiceItems).values({
          invoiceId: invoice.id,
          description: `Service ${j + 1} - Professional services`,
          quantity,
          unitPrice,
          totalPrice: itemAmount
        });
      }
    }
  }
  
  // 3. Add sample bank statements and transactions
  console.log('Adding bank statements and transactions...');
  
  // Create 2 bank statements
  const bankStatementData = [
    {
      accountNumber: 'ACCT-12345678',
      bankName: 'First National Bank',
      statementDate: new Date(2023, 0, 31),
      startingBalance: 25000,
      endingBalance: 32500,
      currency: 'USD'
    },
    {
      accountNumber: 'ACCT-12345678',
      bankName: 'First National Bank',
      statementDate: new Date(2023, 1, 28),
      startingBalance: 32500,
      endingBalance: 37800,
      currency: 'USD'
    }
  ];
  
  for (const statementData of bankStatementData) {
    // Create document for statement
    const docSampleText = `Bank Statement
Account: ${statementData.accountNumber}
Bank: ${statementData.bankName}
Date: ${statementData.statementDate.toISOString().split('T')[0]}
Starting Balance: $${statementData.startingBalance.toFixed(2)}
Ending Balance: $${statementData.endingBalance.toFixed(2)}`;
    
    const [document] = await db.insert(documents).values({
      fileName: `BankStatement_${statementData.statementDate.toISOString().split('T')[0]}.pdf`,
      fileType: 'bank_statement',
      originalText: docSampleText,
      processingStatus: 'processed'
    }).returning();
    
    // Create bank statement
    const [statement] = await db.insert(bankStatements).values({
      documentId: document.id,
      ...statementData,
      metadata: {}
    }).returning();
    
    // Get all paid invoices to match some of them with transactions
    const paidInvoices = await db.select().from(invoices).where(eq(invoices.status, 'paid'));
    
    // Create 10-15 transactions for this statement
    const transactionCount = Math.floor(Math.random() * 6) + 10;
    const monthDays = new Date(statementData.statementDate.getFullYear(), statementData.statementDate.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < transactionCount; i++) {
      const isDeposit = Math.random() > 0.4;
      const amount = parseFloat((Math.random() * 2000 + 100).toFixed(2));
      const date = new Date(statementData.statementDate.getFullYear(), statementData.statementDate.getMonth(), Math.floor(Math.random() * monthDays) + 1);
      
      // If this is a deposit, it might be a payment for one of our invoices
      let reconciledWithInvoiceId = null;
      if (isDeposit && paidInvoices.length > 0 && Math.random() > 0.5) {
        // Randomly select a paid invoice
        const randomInvoice = paidInvoices[Math.floor(Math.random() * paidInvoices.length)];
        reconciledWithInvoiceId = randomInvoice.id;
      }
      
      await db.insert(bankTransactions).values({
        bankStatementId: statement.id,
        date,
        description: isDeposit 
          ? `Payment received ${reconciledWithInvoiceId ? 'for invoice' : 'from customer'}` 
          : 'Business expense',
        amount,
        type: isDeposit ? 'credit' : 'debit',
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
        senderReceiver: isDeposit 
          ? reconciledWithInvoiceId ? 'Matched Client' : 'Customer' 
          : 'Vendor',
        reconciled: reconciledWithInvoiceId !== null,
        reconciledWithInvoiceId,
        metadata: {}
      });
    }
  }

  console.log('✅ Database seeded successfully!');
}

// Run the seed function
seedDatabase()
  .catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed script completed.');
    // Close database connection
    db.end();
    process.exit(0);
  });