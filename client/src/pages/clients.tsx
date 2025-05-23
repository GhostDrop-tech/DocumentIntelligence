import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientList from "@/components/clients/ClientList";
import ClientDetail from "@/components/clients/ClientDetail";

export default function Clients() {
  const [location] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("id");
    if (clientId) {
      setSelectedClientId(parseInt(clientId));
    }
  }, [location]);

  return (
    <MainLayout title="Client Management">
      {selectedClientId ? (
        <ClientDetail 
          clientId={selectedClientId}
          onBack={() => setSelectedClientId(null)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientList onSelectClient={(id) => setSelectedClientId(id)} />
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
