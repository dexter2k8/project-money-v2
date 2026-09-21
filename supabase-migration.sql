-- Supabase Migration: Firebase to Supabase
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

-- =====================================================
-- 1. TABELA: contas (Accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acctid TEXT NOT NULL,
  accttype TEXT NOT NULL DEFAULT '',
  bankid INTEGER NOT NULL DEFAULT 0,
  branchid TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contas_user_id ON contas(user_id);
CREATE INDEX idx_contas_acctid ON contas(acctid);

-- =====================================================
-- 2. TABELA: bancos (Banks)
-- =====================================================
CREATE TABLE IF NOT EXISTS bancos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  alias TEXT NOT NULL DEFAULT ''
);

-- =====================================================
-- 3. TABELA: extratos (Transactions)
-- Substitui a subcollection contas/{accountId}/extratos
-- =====================================================
CREATE TABLE IF NOT EXISTS extratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  trntype TEXT NOT NULL DEFAULT '',
  dtposted DATE NOT NULL,
  trnamt NUMERIC(15, 2) NOT NULL DEFAULT 0,
  memo TEXT NOT NULL DEFAULT '',
  chknum TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_extratos_account_id ON extratos(account_id);
CREATE INDEX idx_extratos_dtposted ON extratos(dtposted);
CREATE INDEX idx_extratos_account_dtposted ON extratos(account_id, dtposted);

-- =====================================================
-- 4. TABELA: saldos (Balances)
-- Substitui a subcollection contas/{accountId}/saldos
-- =====================================================
CREATE TABLE IF NOT EXISTS saldos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  enddate DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saldos_account_id ON saldos(account_id);
CREATE INDEX idx_saldos_enddate ON saldos(enddate);
CREATE INDEX idx_saldos_account_enddate ON saldos(account_id, enddate);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE extratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos ENABLE ROW LEVEL SECURITY;

-- Políticas para contas: usuários só veem suas próprias contas
CREATE POLICY "Users can view own accounts"
  ON contas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON contas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON contas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON contas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para bancos: todos autenticados podem ler, service_role gerencia escrita
CREATE POLICY "Authenticated users can view banks"
  ON bancos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Políticas para extratos: usuários só veem extratos das suas contas
CREATE POLICY "Users can view own extratos"
  ON extratos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = extratos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own extratos"
  ON extratos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = extratos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own extratos"
  ON extratos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = extratos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own extratos"
  ON extratos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = extratos.account_id
      AND contas.user_id = auth.uid()
    )
  );

-- Políticas para saldos: usuários só veem saldos das suas contas
CREATE POLICY "Users can view own saldos"
  ON saldos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = saldos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own saldos"
  ON saldos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = saldos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own saldos"
  ON saldos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = saldos.account_id
      AND contas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own saldos"
  ON saldos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contas
      WHERE contas.id = saldos.account_id
      AND contas.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. SERVICE_ROLE bypssa RLS para API routes
-- As API routes usam a service_role key, que bypassa RLS.
-- As políticas RLS acima protegem apenas o client-side.
-- =====================================================

-- =====================================================
-- 7. (OPCIONAL) Inserir bancos de exemplo
-- =====================================================
INSERT INTO bancos (id, name, alias) VALUES
  ('001', 'Banco do Brasil', 'BB'),
  ('033', 'Santander', 'SANT'),
  ('041', 'Banrisul', 'BANR'),
  ('070', 'Bradesco', 'BRADESCO'),
  ('077', 'Banco Inter', 'INTER'),
  ('104', 'Caixa Econômica', 'CEF'),
  ('197', 'Stone', 'STONE'),
  ('208', 'BTG Pactual', 'BTG'),
  ('212', 'Banco Original', 'ORIGINAL'),
  ('260', 'Nu Pagamentos', 'NU'),
  ('318', 'BMG', 'BMG'),
  ('336', 'C6 Bank', 'C6'),
  ('341', 'Itaú Unibanco', 'ITAÚ'),
  ('389', 'Mercado Pago', 'MERCADO'),
  ('623', 'Pan', 'PAN'),
  ('707', 'Daycoval', 'DAYCOVAL'),
  ('741', 'Ribeirão Preto', 'RIBPRETO'),
  ('748', 'Sicredi', 'SICREDI'),
  ('756', 'Sicoob', 'SICOOB')
ON CONFLICT (id) DO NOTHING;
