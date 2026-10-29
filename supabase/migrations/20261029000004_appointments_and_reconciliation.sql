-- Migration: 20261029000004_appointments_and_reconciliation.sql
-- Subsystem: Appointments Lifecycle & Reconciliation Engine with forced RLS

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    appointment_type TEXT NOT NULL DEFAULT 'hearing_test',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'attended', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    outcome TEXT CHECK (outcome IN ('hearing_aid_fitted', 'assessment_completed', 'follow_up_advised', 'medical_referral', 'wax_cleared', 'other')),
    outcome_notes TEXT,
    revenue_cents INTEGER DEFAULT 0,
    external_calendar_id TEXT,
    external_provider TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_inquiry ON appointments(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(organization_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON appointments(organization_id, external_calendar_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access appointments within their organization"
ON appointments
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

CREATE TABLE IF NOT EXISTS unmatched_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    external_calendar_id TEXT NOT NULL,
    external_provider TEXT NOT NULL,
    title TEXT NOT NULL,
    attendee_name TEXT,
    attendee_email TEXT,
    attendee_phone TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    resolution_status TEXT NOT NULL CHECK (resolution_status IN ('pending', 'matched', 'created_new', 'ignored')) DEFAULT 'pending',
    resolved_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_unmatched_bookings_org ON unmatched_bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_unmatched_bookings_status ON unmatched_bookings(organization_id, resolution_status);

ALTER TABLE unmatched_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_bookings FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access unmatched bookings within their organization"
ON unmatched_bookings
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
