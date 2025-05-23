import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDocument } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Cloud, X, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export default function DocumentUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<'invoice' | 'bank_statement'>('invoice');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter only PDF files
    const pdfFiles = acceptedFiles.filter(
      file => file.type === 'application/pdf'
    );
    
    if (pdfFiles.length < acceptedFiles.length) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF files are allowed',
        variant: 'destructive',
      });
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload each file
      for (const file of files) {
        await uploadDocument(file, fileType);
        
        toast({
          title: 'Upload successful',
          description: `${file.name} has been uploaded and is being processed`,
        });
      }
      
      // Clear the files
      setFiles([]);
      
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/documents/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setFiles([]);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-5">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        
        <div
          {...getRootProps()}
          className={`dropzone rounded-lg p-6 text-center cursor-pointer border-2 border-dashed ${
            isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <Cloud className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">
            Drag & drop PDFs here or <span className="text-primary">browse files</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supported files: Invoices and Bank Statements (PDF)
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-gray-50 rounded-md p-2"
                >
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge 
            variant={fileType === 'invoice' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFileType('invoice')}
          >
            Invoice
          </Badge>
          <Badge 
            variant={fileType === 'bank_statement' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFileType('bank_statement')}
          >
            Bank Statement
          </Badge>
        </div>
        
        <div className="mt-4 text-right space-x-2">
          <Button 
            variant="outline" 
            onClick={cancelUpload}
            disabled={files.length === 0 || isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="bg-primary text-white hover:bg-blue-600"
          >
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
