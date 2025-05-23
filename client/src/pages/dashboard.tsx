import MainLayout from "@/components/layout/MainLayout";
import DocumentUpload from "@/components/documents/DocumentUpload";
import KPICards from "@/components/dashboard/KPICards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopClients from "@/components/dashboard/TopClients";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import ReconciliationStatus from "@/components/dashboard/ReconciliationStatus";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getRecentDocuments } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: () => getDashboardData(),
  });

  const { data: recentDocuments, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ['/api/documents/recent'],
    queryFn: () => getRecentDocuments(),
  });

  return (
    <MainLayout title="Dashboard Overview">
      {/* Upload section */}
      <DocumentUpload />
      
      {/* Recent Uploads */}
      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-3">Recent Uploads</h3>
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isDocumentsLoading && (
                  <>
                    {[1, 2, 3].map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-12" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                
                {!isDocumentsLoading && recentDocuments?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No documents have been uploaded yet
                    </td>
                  </tr>
                )}
                
                {!isDocumentsLoading && recentDocuments?.length > 0 && (
                  <>
                    {recentDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge 
                            className={
                              doc.fileType === 'invoice' 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
                            }
                          >
                            {doc.fileType === 'invoice' ? 'Invoice' : 'Bank Statement'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              doc.processingStatus === 'processed' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : doc.processingStatus === 'processing' 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : doc.processingStatus === 'error'
                                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }
                          >
                            {doc.processingStatus === 'processed' ? 'Processed' : 
                             doc.processingStatus === 'processing' ? 'Processing' :
                             doc.processingStatus === 'error' ? 'Error' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link 
                            href={doc.fileType === 'invoice' 
                              ? `/invoices?document=${doc.id}` 
                              : `/bank-statements?document=${doc.id}`
                            }
                          >
                            <Button variant="link" className="text-primary p-0">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* KPI Cards */}
      {isDashboardLoading ? (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex items-center mt-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <KPICards 
          totalRevenue={dashboardData?.kpis?.totalRevenue || 0}
          unpaidInvoicesTotal={dashboardData?.kpis?.unpaidInvoicesTotal || 0}
          totalClients={dashboardData?.kpis?.totalClients || 0}
          reconciliationPercentage={dashboardData?.kpis?.reconciliationPercentage || 0}
        />
      )}
      
      {/* Charts & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <TopClients />
        </div>
      </div>
      
      {/* Invoices and Reconciliation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentInvoices />
        <ReconciliationStatus />
      </div>
      
      {/* Export & Actions */}
      <ActionButtons />
    </MainLayout>
  );
}
