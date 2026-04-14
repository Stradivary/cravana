-- =====================================================================
-- Cravana - Add payments table for webhook/payment audit trail
-- Jalankan di Supabase SQL Editor
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID        NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  provider            TEXT        NOT NULL DEFAULT 'xendit',
  payment_method      TEXT        NOT NULL DEFAULT 'qris',

  xendit_event_id     TEXT        NULL,
  xendit_reference_id TEXT        NULL,
  xendit_qr_id        TEXT        NULL,

  provider_status     TEXT        NULL,
  normalized_status   TEXT        NULL
                      CHECK (normalized_status IN ('paid', 'expired', 'failed') OR normalized_status IS NULL),

  amount              INTEGER     NULL CHECK (amount IS NULL OR amount >= 0),
  currency            TEXT        NULL DEFAULT 'IDR',

  processing_result   TEXT        NOT NULL
                      CHECK (processing_result IN ('processed', 'ignored_status', 'ignored_order_not_found', 'ignored_already_paid', 'update_failed')),
  note                TEXT        NULL,
  request_id          TEXT        NULL,

  raw_payload         JSONB       NOT NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for query speed
CREATE INDEX IF NOT EXISTS idx_payments_order_id            ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at          ON public.payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_reference_id        ON public.payments (xendit_reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_qr_id               ON public.payments (xendit_qr_id);
CREATE INDEX IF NOT EXISTS idx_payments_result              ON public.payments (processing_result);
CREATE INDEX IF NOT EXISTS idx_payments_normalized_status   ON public.payments (normalized_status);

-- Optional dedupe: only unique when event_id is present
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_xendit_event_id
  ON public.payments (xendit_event_id)
  WHERE xendit_event_id IS NOT NULL;

-- Enable RLS (service role used by backend will bypass)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_via_order" ON public.payments;
CREATE POLICY "payments_select_via_order"
  ON public.payments FOR SELECT
  USING (
    order_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND auth.uid()::text = o.user_id::text
    )
  );
