-- 20261029000002_contacts_inquiries_activities.sql
-- Kuro Solutions CRM SaaS: Contacts, Inquiries, and Activities with RLS

-- Contacts (The long-lived human entity)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    phone_normalized TEXT,
    alternate_phone TEXT,
    address TEXT,
    preferred_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inquiries (Specific interest events, marketing attribution, and conversion lifecycle)
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    assigned_user_id UUID,
    source TEXT NOT NULL CHECK (source IN ('phone', 'website', 'whatsapp', 'meta_ads', 'email', 'walk_in', 'referral', 'portal', 'direct')),
    status TEXT NOT NULL CHECK (status IN (
        'new',
        'contacted',
        'follow_up_needed',
        'appointment_booked',
        'completed',
        'waiting_response',
        'not_booked',
        'cancelled',
        'no_show',
        'lost'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    loss_reason TEXT,
    notes TEXT,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities (Immutable chronological audit log of all customer touches & staff actions)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
    user_id UUID,
    staff_name TEXT NOT NULL DEFAULT 'System / Automations',
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'inquiry_created',
        'note_added',
        'call_logged',
        'email_sent',
        'email_received',
        'whatsapp_sent',
        'whatsapp_received',
        'status_changed',
        'priority_changed',
        'assigned_changed',
        'appointment_scheduled',
        'appointment_outcome',
        'lead_merged'
    )),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_norm ON contacts(organization_id, phone_normalized);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(organization_id, email);
CREATE INDEX IF NOT EXISTS idx_inquiries_org_status ON inquiries(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_contact ON inquiries(contact_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_location ON inquiries(organization_id, location_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON inquiries(organization_id, assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_inquiry ON activities(inquiry_id, created_at DESC);

-- Enable and Force Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts FORCE ROW LEVEL SECURITY;

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries FORCE ROW LEVEL SECURITY;

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities FORCE ROW LEVEL SECURITY;

-- Security Policies

-- Contacts RLS Policies
CREATE POLICY contacts_select_policy ON contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = contacts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY contacts_insert_policy ON contacts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = contacts.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );

CREATE POLICY contacts_update_policy ON contacts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = contacts.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );

CREATE POLICY contacts_delete_policy ON contacts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = contacts.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Inquiries RLS Policies
CREATE POLICY inquiries_select_policy ON inquiries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = inquiries.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY inquiries_insert_policy ON inquiries
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = inquiries.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );

CREATE POLICY inquiries_update_policy ON inquiries
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = inquiries.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );

CREATE POLICY inquiries_delete_policy ON inquiries
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = inquiries.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Activities RLS Policies
CREATE POLICY activities_select_policy ON activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = activities.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY activities_insert_policy ON activities
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = activities.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );
