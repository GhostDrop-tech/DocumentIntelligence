import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, MessageSquare } from "lucide-react";

export default function Help() {
  return (
    <MainLayout title="Help & Support">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using FinDocManager.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I upload documents?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      You can upload documents from the Dashboard by using the document upload section. 
                      Simply drag and drop your PDF files or click to browse your files.
                    </p>
                    <p className="mb-2">
                      Select the document type (Invoice or Bank Statement) before uploading. 
                      The system will process the document automatically using AI to extract the relevant information.
                    </p>
                    <p>
                      The processing may take a few seconds. Once complete, the extracted information will be stored 
                      in the system and visible in the respective sections.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the AI extract information from documents?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      FinDocManager uses OpenAI's advanced AI models to analyze and extract structured information from your PDF documents.
                    </p>
                    <p className="mb-2">
                      For invoices, the system extracts details like client name, invoice number, issue date, due date, 
                      line items, and total amounts.
                    </p>
                    <p>
                      For bank statements, it extracts transaction details including dates, amounts, descriptions, 
                      and reference numbers. This information is then stored in a structured database for easy access and management.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I reconcile invoices with bank statements?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The reconciliation process helps you match payments from bank statements to your invoices.
                    </p>
                    <p className="mb-2">
                      Navigate to the Reconciliation page to see unmatched transactions. For each transaction, 
                      you can select which invoice it corresponds to.
                    </p>
                    <p>
                      The system also attempts to automatically match transactions to invoices based on amount, 
                      date, and client information. You can review and confirm these matches or adjust them as needed.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I edit extracted information if it's incorrect?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Yes, you can manually edit any information extracted by the AI if it's not accurate.
                    </p>
                    <p className="mb-2">
                      For invoices, go to the Invoices page, select the invoice you want to edit, 
                      and use the edit button to modify any field.
                    </p>
                    <p>
                      Similarly, for bank statements, you can edit transaction details if needed. 
                      The system will save your changes and use them for reconciliation purposes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I export data from the system?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      FinDocManager allows you to export your data in various formats, primarily CSV.
                    </p>
                    <p className="mb-2">
                      On the Dashboard, you'll find export buttons that allow you to download different reports, 
                      such as unpaid invoices, reconciliation status, or client summaries.
                    </p>
                    <p>
                      You can also export specific data from individual sections like Invoices or Bank Statements 
                      using the export options available in those areas.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Need help? Get in touch with our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>support@findocmanager.com</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span>Live chat available 9am-5pm EST</span>
              </div>
              
              <Button className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Explore our detailed documentation resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-between">
                User Guide 
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                API Documentation
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" className="w-full justify-between">
                Video Tutorials
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
