import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart4 } from "lucide-react";
import { exportInvoicesToCSV } from "@/lib/api";

export default function ActionButtons() {
  const handleExportCSV = () => {
    exportInvoicesToCSV();
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-medium mb-1">Export Data</h3>
          <p className="text-sm text-gray-500">Download your data in different formats</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="bg-white"
          >
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Monthly Report
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white"
            onClick={handleExportCSV}
          >
            <Download className="h-5 w-5 mr-2 text-gray-500" />
            Export to CSV
          </Button>
          
          <Button className="bg-primary text-white hover:bg-blue-600">
            <BarChart4 className="h-5 w-5 mr-2" />
            Download All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
