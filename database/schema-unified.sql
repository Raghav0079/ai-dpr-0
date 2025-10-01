-- =======================================================
-- AI DPR System - Unified Database Schema
-- =======================================================
-- Run this in your Supabase SQL Editor
-- This replaces all other schema files

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- Core Tables
-- =======================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  department TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  department TEXT,
  project_manager_id UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_project_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Reports table with AI analysis fields
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN (
    'Budget Mismatch', 'Unrealistic Schedule', 'Resource Allocation', 
    'Technical Risk', 'Compliance Issue', 'Quality Concern', 
    'Environmental Impact', 'Safety Issue', 'Legal Issue', 'Stakeholder Concern'
  )),
  description TEXT NOT NULL,
  current_status TEXT,
  challenges TEXT,
  next_steps TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'In Progress', 'Resolved', 'Closed')),
  due_date DATE,
  
  -- AI Analysis fields
  ai_analysis TEXT,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_score DECIMAL(3, 2) CHECK (risk_score >= 0 AND risk_score <= 1),
  sentiment_score DECIMAL(3, 2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  
  -- Metadata
  assigned_to UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  reviewer_id UUID REFERENCES public.users(id),
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_due_date CHECK (due_date IS NULL OR due_date >= created_at::DATE)
);

-- File attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT CHECK (file_size > 0),
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- Indexes for Performance
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_department ON public.projects(department);

CREATE INDEX IF NOT EXISTS idx_reports_project ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON public.reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_issue_type ON public.reports(issue_type);
CREATE INDEX IF NOT EXISTS idx_reports_assigned ON public.reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_files_report ON public.file_attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_logs(table_name, record_id);

-- =======================================================
-- Triggers and Functions
-- =======================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, to_jsonb(OLD),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(OLD), to_jsonb(NEW),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(NEW),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_reports AFTER INSERT OR UPDATE OR DELETE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =======================================================
-- Row Level Security (RLS)
-- =======================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "System can insert user profiles" ON public.users
  FOR INSERT WITH CHECK (true);

-- Projects policies  
CREATE POLICY "Users can view all projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Reports policies
CREATE POLICY "Users can view all reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assigned reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND (
        id = created_by OR 
        id = assigned_to OR 
        role IN ('admin', 'manager')
      )
    )
  );

-- File attachments policies
CREATE POLICY "Users can view file attachments" ON public.file_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can upload attachments" ON public.file_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid()
    )
  );

-- =======================================================
-- Views for Analytics
-- =======================================================
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.reports) AS total_reports,
  (SELECT COUNT(*) FROM public.reports WHERE status = 'Open') AS open_reports,
  (SELECT COUNT(*) FROM public.reports WHERE severity IN ('High', 'Critical')) AS critical_reports,
  (SELECT COUNT(*) FROM public.reports WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_reports,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'active') AS active_projects,
  (SELECT COALESCE(AVG(confidence_score), 0) FROM public.reports WHERE confidence_score IS NOT NULL) AS avg_confidence_score;

CREATE OR REPLACE VIEW public.report_summary AS
SELECT 
  r.id,
  r.title,
  r.issue_type,
  r.severity,
  r.status,
  r.confidence_score,
  r.risk_score,
  r.created_at,
  p.name as project_name,
  p.department,
  u.full_name as reporter_name,
  a.full_name as assigned_name
FROM public.reports r
LEFT JOIN public.projects p ON r.project_id = p.id
LEFT JOIN public.users u ON r.created_by = u.id
LEFT JOIN public.users a ON r.assigned_to = a.id;

-- Grant permissions
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.report_summary TO authenticated;

-- =======================================================
-- Sample Data
-- =======================================================

-- Insert sample project
INSERT INTO public.projects (
  name, description, budget, start_date, end_date, 
  status, department, location
) VALUES (
  'Digital Infrastructure Upgrade',
  'Comprehensive upgrade of digital infrastructure including network, servers, and security systems',
  5000000.00,
  '2024-01-01',
  '2024-12-31',
  'active',
  'IT',
  'Mumbai'
) ON CONFLICT DO NOTHING;

-- =======================================================
-- End of Schema
-- =======================================================