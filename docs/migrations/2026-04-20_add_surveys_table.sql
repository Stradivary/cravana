-- =====================================================================
-- Cravana - Add surveys table for public review submissions
-- Jalankan di Supabase SQL Editor
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.surveys (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 80),
  review      TEXT        NOT NULL CHECK (char_length(trim(review)) BETWEEN 10 AND 280),
  is_visible  BOOLEAN     NOT NULL DEFAULT true,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_surveys_created_at_desc
  ON public.surveys (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_surveys_visibility
  ON public.surveys (is_visible, is_active, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_surveys_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_surveys_updated_at ON public.surveys;
CREATE TRIGGER trg_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.set_surveys_updated_at();

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "surveys_public_select_visible" ON public.surveys;
CREATE POLICY "surveys_public_select_visible"
  ON public.surveys FOR SELECT
  USING (is_visible = true AND is_active = true);

DROP POLICY IF EXISTS "surveys_public_insert" ON public.surveys;
CREATE POLICY "surveys_public_insert"
  ON public.surveys FOR INSERT
  WITH CHECK (true);
