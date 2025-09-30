-- AI DPR System Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_manager_id UUID REFERENCES public.users(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    department VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    user_id UUID REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    issue_type VARCHAR(100),
    description TEXT,
    current_status TEXT,
    challenges TEXT,
    next_steps TEXT,
    budget_info JSONB,
    timeline_info JSONB,
    resource_info JSONB,
    risk_assessment JSONB,
    attachments JSONB DEFAULT '[]'::jsonb,
    ai_analysis TEXT,
    ai_insights JSONB,
    ai_risk_score DECIMAL(3,2) DEFAULT 0,
    ai_confidence_score DECIMAL(3,2) DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    submission_date DATE,
    review_date DATE,
    reviewer_id UUID REFERENCES public.users(id),
    reviewer_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table for file uploads
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.users(id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for report comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id),
    user_id UUID REFERENCES public.users(id),
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_reports_project ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_files_report ON public.files(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_report ON public.comments(report_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- Projects are visible to all authenticated users
CREATE POLICY "Projects are viewable by authenticated users" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Project managers can update their projects" ON public.projects FOR UPDATE USING (auth.uid()::text = project_manager_id::text);

-- Reports are visible to project members and managers
CREATE POLICY "Reports are viewable by authenticated users" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Files are accessible with reports
CREATE POLICY "Files are viewable with reports" ON public.files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload files" ON public.files FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = uploaded_by::text);

-- Comments are visible to all authenticated users
CREATE POLICY "Comments are viewable by authenticated users" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

-- Notifications are user-specific
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert default admin user (password: admin123 - change this!)
INSERT INTO public.users (email, password_hash, full_name, role, department, is_active)
VALUES (
    'admin@aidpr.com',
    '$2a$10$K7L1OJ45/4Y2nIrgGDUOe.3/rR5E3Ftx3OxJhvOh0b7l8bOKpOD7m', -- admin123
    'System Administrator',
    'admin',
    'IT',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample project
INSERT INTO public.projects (name, description, start_date, end_date, budget, status, department, location)
VALUES (
    'Digital Infrastructure Upgrade',
    'Comprehensive upgrade of digital infrastructure including network, servers, and security systems',
    '2024-01-01',
    '2024-12-31',
    5000000.00,
    'active',
    'IT',
    'Mumbai'
) ON CONFLICT DO NOTHING;

-- Create a view for report analytics
CREATE OR REPLACE VIEW public.report_analytics AS
SELECT 
    r.id,
    r.title,
    r.report_type,
    r.issue_type,
    r.status,
    r.ai_risk_score,
    r.ai_confidence_score,
    r.sentiment_score,
    r.created_at,
    r.submission_date,
    p.name as project_name,
    p.department,
    u.full_name as reporter_name,
    u.email as reporter_email
FROM public.reports r
LEFT JOIN public.projects p ON r.project_id = p.id
LEFT JOIN public.users u ON r.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON public.report_analytics TO authenticated;