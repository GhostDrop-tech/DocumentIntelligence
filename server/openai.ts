import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Process invoice PDF text with OpenAI
export async function processInvoice(pdfText: string): Promise<{
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount?: number;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  metadata?: Record<string, any>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a financial document extraction specialist. Extract data from invoice PDFs accurately and return it in a structured format. Be precise with numbers, dates, and other details."
        },
        {
          role: "user",
          content: 
            `Extract the following fields from this invoice PDF:
             - client name
             - invoice number
             - issue date (in YYYY-MM-DD format)
             - due date (in YYYY-MM-DD format)
             - total amount (numeric value only)
             - tax amount if present (numeric value only)
             - currency
             - list of items with descriptions, quantities, unit prices, and total prices
            
             Return the result as a JSON object with the following structure:
             {
              "clientName": string,
              "invoiceNumber": string,
              "issueDate": string,
              "dueDate": string,
              "totalAmount": number,
              "taxAmount": number (optional),
              "currency": string,
              "items": [
                {
                  "description": string,
                  "quantity": number,
                  "unitPrice": number,
                  "totalPrice": number
                }
              ],
              "metadata": { } (any additional useful information)
             }

             Here is the invoice text:
             ${pdfText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error processing invoice with OpenAI:", error);
    throw new Error(`Failed to process invoice: ${error.message}`);
  }
}

// Process bank statement PDF text with OpenAI
export async function processBankStatement(pdfText: string): Promise<{
  bankName: string;
  accountNumber: string;
  statementDate: string;
  startingBalance: number;
  endingBalance: number;
  currency: string;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
    reference?: string;
    senderReceiver?: string;
  }>;
  metadata?: Record<string, any>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a financial document extraction specialist. Extract data from bank statement PDFs accurately and return it in a structured format. Be precise with numbers, dates, and other details."
        },
        {
          role: "user",
          content: 
            `Extract the following fields from this bank statement PDF:
             - bank name
             - account number
             - statement date (in YYYY-MM-DD format)
             - starting balance (numeric value only)
             - ending balance (numeric value only)
             - currency
             - list of transactions with dates, descriptions, amounts, types (debit/credit), reference numbers, and sender/receiver information
            
             Return the result as a JSON object with the following structure:
             {
              "bankName": string,
              "accountNumber": string,
              "statementDate": string,
              "startingBalance": number,
              "endingBalance": number,
              "currency": string,
              "transactions": [
                {
                  "date": string (YYYY-MM-DD),
                  "description": string,
                  "amount": number,
                  "type": string ("debit" or "credit"),
                  "reference": string (optional),
                  "senderReceiver": string (optional)
                }
              ],
              "metadata": { } (any additional useful information)
             }

             Here is the bank statement text:
             ${pdfText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error processing bank statement with OpenAI:", error);
    throw new Error(`Failed to process bank statement: ${error.message}`);
  }
}
