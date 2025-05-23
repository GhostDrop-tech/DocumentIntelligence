import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useLocation } from "wouter";
import BankStatementList from "@/components/bank-statements/BankStatementList";
import BankStatementDetail from "@/components/bank-statements/BankStatementDetail";

export default function BankStatements() {
  const [location] = useLocation();
  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);

  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statementId = params.get("id");
    if (statementId) {
      setSelectedStatementId(parseInt(statementId));
    }
  }, [location]);

  return (
    <MainLayout title="Bank Statements">
      {selectedStatementId ? (
        <BankStatementDetail
          statementId={selectedStatementId}
          onBack={() => setSelectedStatementId(null)}
        />
      ) : (
        <BankStatementList
          onSelectStatement={(id) => setSelectedStatementId(id)}
        />
      )}
    </MainLayout>
  );
}
