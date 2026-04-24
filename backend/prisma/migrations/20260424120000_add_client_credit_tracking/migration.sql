-- Saldo de crédito materializado por cliente (tudo inicia em 0)
ALTER TABLE "clients" ADD COLUMN "credit_balance" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Rastreio por devolução: cliente destinatário, valor histórico e método aplicado
ALTER TABLE "returns" ADD COLUMN "client_id" INTEGER;
ALTER TABLE "returns" ADD COLUMN "refund_value" DECIMAL(10,2);
ALTER TABLE "returns" ADD COLUMN "resolution_method" VARCHAR(30);

-- Ligação da transação financeira com o cliente (crédito/reembolso)
ALTER TABLE "financial_transactions" ADD COLUMN "client_id" INTEGER;

-- Índices para consultas por cliente
CREATE INDEX "idx_returns_client_id" ON "returns"("client_id");
CREATE INDEX "idx_financial_transactions_client_id" ON "financial_transactions"("client_id");

-- FKs: ON DELETE SET NULL garante que apagar um cliente não destrói histórico
ALTER TABLE "returns" ADD CONSTRAINT "returns_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "clients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "clients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
