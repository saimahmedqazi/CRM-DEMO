-- 20261029000003_tasks_and_pipeline_stages.sql
-- Kuro Solutions CRM SaaS: Tasks and Configurable Pipeline Stages with RLS

-- Pipeline Stages per Organization
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    is_terminal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, stage_key)
);

-- Follow-up Tasks & Action Items
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
    assigned_user_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL CHECK (task_type IN (
        'initial_response',
        'follow_up_call',
        'send_quote',
        'recall',
        'appointment_confirmation',
        'general_reminder'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    outcome_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_org_due ON tasks(organization_id, is_completed, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_inquiry ON tasks(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(organization_id, assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_stages_org_order ON pipeline_stages(organization_id, display_order ASC);

-- Enable & Force Row Level Security (RLS)
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages FORCE ROW LEVEL SECURITY;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

-- Security Policies

-- Pipeline Stages
CREATE POLICY stages_select_policy ON pipeline_stages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = pipeline_stages.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY stages_admin_policy ON pipeline_stages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = pipeline_stages.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Tasks
CREATE POLICY tasks_select_policy ON tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = tasks.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY tasks_mutate_policy ON tasks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = tasks.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'manager', 'agent')
        )
    );
