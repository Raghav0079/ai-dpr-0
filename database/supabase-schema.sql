-- =======================================================
-- AI DPR System Database Schema for Supabase
-- =======================================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- Function: Generate Report IDs (before reports table)
-- =======================================================
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 9) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.reports
  WHERE id LIKE 'RPT-' || year_part || '-%';

  -- Generate new ID
  new_id := 'RPT-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- =======================================================
-- Users table (extends Supabase auth.users)
-- =======================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  department TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- Projects table
-- =======================================================
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
  project_manager_id UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_project_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- =======================================================
-- Reports table
-- =======================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT generate_report_id(),
  title TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL, -- Denormalized
  department TEXT,
  assigned_to TEXT,
  assigned_user_id UUID REFERENCES public.users(id),
  issue_type TEXT NOT NULL CHECK (issue_type IN (
    'Budget Mismatch', 
    'Unrealistic Schedule', 
    'Resource Allocation', 
    'Technical Risk', 
    'Compliance Issue', 
    'Quality Concern', 
    'Environmental Impact', 
    'Safety Issue',
    'Legal Issue',
    'Stakeholder Concern'
  )),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'In Progress', 'Resolved', 'Closed', 'Cancelled')),
  due_date DATE,
  tags TEXT[], -- Array of tags

  -- AI Analysis fields
  ai_analysis TEXT,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  completeness_score DECIMAL(3, 2) CHECK (completeness_score >= 0 AND completeness_score <= 1),
  compliance_score DECIMAL(3, 2) CHECK (compliance_score >= 0 AND compliance_score <= 1),
  risk_score DECIMAL(3, 2) CHECK (risk_score >= 0 AND risk_score <= 1),

  -- Metadata
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(project_name, '') || ' ' || 
      COALESCE(department, '') || ' ' ||
      COALESCE(array_to_string(tags, ' '), '')
    )
  ) STORED,

  CONSTRAINT check_due_date CHECK (due_date IS NULL OR due_date >= created_at::DATE)
);

-- =======================================================
-- File attachments table
-- =======================================================
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT REFERENCES public.reports(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT CHECK (file_size IS NULL OR file_size > 0),
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'report-attachments',

  -- File analysis results
  ocr_text TEXT,
  ocr_confidence DECIMAL(3, 2),
  analysis_results JSONB DEFAULT '{}',

  uploaded_by UUID REFERENCES public.users(id),
  upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- AI analysis logs
-- =======================================================
CREATE TABLE IF NOT EXISTS public.ai_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT REFERENCES public.reports(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  output_analysis JSONB,
  confidence_score DECIMAL(3, 2),
  processing_time INTEGER, -- ms
  model_version TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- AI processing queue
-- =======================================================
CREATE TABLE IF NOT EXISTS public.ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT REFERENCES public.reports(id) ON DELETE CASCADE,
  file_path TEXT,
  processing_type TEXT NOT NULL CHECK (processing_type IN ('text_analysis', 'ocr', 'compliance_check', 'risk_assessment')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 1,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- =======================================================
-- Audit logs
-- =======================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- System settings
-- =======================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- Indexes
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON public.reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_issue_type ON public.reports(issue_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_user ON public.reports(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_search ON public.reports USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_reports_tags ON public.reports USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_file_attachments_report_id ON public.file_attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_report_id ON public.ai_analysis_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_status ON public.ai_processing_queue(status, priority);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

-- =======================================================
-- Row Level Security (RLS)
-- =======================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- Policies
-- =======================================================

-- Users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Projects
CREATE POLICY "Users can view all projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators and managers can update" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND (
        id = created_by OR 
        id = project_manager_id OR
        role IN ('admin', 'manager')
      )
    )
  );

-- Reports
CREATE POLICY "Users can view all reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Report creators and assigned users can update" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND (
        id = created_by OR 
        id = assigned_user_id OR
        role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Report creators and admins can delete" ON public.reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND (
        id = created_by OR
        role = 'admin'
      )
    )
  );

-- File Attachments
CREATE POLICY "Users can view attachments for accessible reports" ON public.file_attachments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload attachments" ON public.file_attachments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "File uploaders can delete their attachments" ON public.file_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND id = uploaded_by
    )
  );

-- AI Logs
CREATE POLICY "Users can view AI analysis logs" ON public.ai_analysis_logs
  FOR SELECT USING (true);

-- =======================================================
-- Triggers and Functions
-- =======================================================

-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================================
-- Audit Function (optional)
-- =======================================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, to_jsonb(OLD),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()), auth.email());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(OLD), to_jsonb(NEW),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()), auth.email());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(NEW),
            (SELECT id FROM public.users WHERE auth_id = auth.uid()), auth.email());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =======================================================
-- Initial Settings
-- =======================================================
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
  ('app_name', '"AI DPR System"', 'Application name', true),
  ('app_version', '"1.0.0"', 'Application version', true),
  ('maintenance_mode', 'false', 'Maintenance mode flag', false),
  ('max_file_size_mb', '10', 'Max upload size MB', false),
  ('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","txt"]', 'Allowed file types', false),
  ('ai_analysis_enabled', 'true', 'Enable AI analysis', false),
  ('default_language', '"en"', 'Default system language', true),
  ('supported_languages', '["en","hi","te","ta","bn","gu"]', 'Supported languages', true)
ON CONFLICT (key) DO NOTHING;

-- =======================================================
-- Views and Search Functions
-- =======================================================
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.reports) AS total_reports,
  (SELECT COUNT(*) FROM public.reports WHERE status = 'Open') AS open_reports,
  (SELECT COUNT(*) FROM public.reports WHERE severity IN ('High', 'Critical')) AS critical_reports,
  (SELECT COUNT(*) FROM public.reports WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_reports,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'active') AS active_projects,
  (SELECT AVG(confidence_score) FROM public.reports WHERE confidence_score IS NOT NULL) AS avg_confidence_score;

CREATE OR REPLACE FUNCTION search_reports(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  project_name TEXT,
  issue_type TEXT,
  severity TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.title, r.project_name, r.issue_type, r.severity, r.status, r.created_at,
         ts_rank(r.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM public.reports r
  WHERE r.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =======================================================
-- End of Schema
-- =======================================================

