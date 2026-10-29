-- Migration: 20261029000005_integrations_and_api_keys.sql
-- Subsystem: Pluggable Integration Framework, Webhooks & API Keys with forced RLS

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    prefix TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage API keys for their organization"
ON api_keys
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('whatsapp', 'meta_ads', 'email', 'phone', 'website', 'calendar')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    credentials_encrypted JSONB DEFAULT '{}'::jsonb,
    webhook_secret TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(organization_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integration_configs_org ON integration_configs(organization_id);

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage integration configs for their organization"
ON integration_configs
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    event_id TEXT,
    idempotency_key TEXT NOT NULL,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    processing_status TEXT NOT NULL CHECK (processing_status IN ('success', 'failed', 'duplicate')) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_org ON webhook_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON webhook_events(organization_id, idempotency_key);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can access webhook events for their organization"
ON webhook_events
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);
