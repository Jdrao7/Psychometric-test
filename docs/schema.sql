-- =============================================
-- HeyAmara Psychometric Test - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Assessment Results Table
-- Stores candidate assessment scores and insights
-- =============================================
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core Trait Scores (0-100)
  ext INT CHECK (ext >= 0 AND ext <= 100),           -- Extraversion
  con INT CHECK (con >= 0 AND con <= 100),           -- Conscientiousness
  emo INT CHECK (emo >= 0 AND emo <= 100),           -- Emotional Stability
  risk INT CHECK (risk >= 0 AND risk <= 100),        -- Risk Tolerance
  dec INT CHECK (dec >= 0 AND dec <= 100),           -- Decision Speed
  mot INT CHECK (mot >= 0 AND mot <= 100),           -- Motivation
  cog INT CHECK (cog >= 0 AND cog <= 100),           -- Cognitive Ability
  
  -- Work Values & Style (JSONB)
  work_values JSONB,          -- { "primary": "growth", "secondary": "stability" }
  work_style JSONB,           -- { "teamRole": "Leader", "conflictStyle": "...", ... }
  
  -- Composite Insights (JSONB)
  composite_insights JSONB,   -- { "cultureFit": {...}, "remoteReadiness": 75, ... }
  
  -- Role Fits (JSONB array)
  role_fits JSONB,            -- [{ "roleId": "...", "title": "...", "fitPercentage": 85 }]
  
  -- Strengths & Risks (text arrays)
  strengths TEXT[],
  risk_areas TEXT[],
  
  -- Quality Metrics
  consistency_score INT,
  avg_response_time DECIMAL(5,2),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_assessment_results_created_at ON assessment_results(created_at DESC);


-- =============================================
-- 2. Custom Roles Table
-- Recruiter-created role criteria
-- =============================================
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Trait Configuration
  trait_weights JSONB NOT NULL DEFAULT '{
    "EXT": 1.0, "CON": 1.0, "EMO": 1.0, 
    "RISK": 1.0, "DEC": 1.0, "MOT": 1.0, "COG": 1.0
  }',
  -- Example: { "EXT": 1.5, "CON": 1.0, "EMO": 0.8, ... }
  
  ideal_ranges JSONB NOT NULL DEFAULT '{
    "EXT": {"min": 40, "max": 80},
    "CON": {"min": 50, "max": 90},
    "EMO": {"min": 50, "max": 90},
    "RISK": {"min": 30, "max": 70},
    "DEC": {"min": 40, "max": 80},
    "MOT": {"min": 50, "max": 95},
    "COG": {"min": 50, "max": 100}
  }',
  -- Example: { "EXT": { "min": 70, "max": 95 }, ... }
  
  -- Culture & Style Requirements
  culture_preference TEXT CHECK (culture_preference IN ('startup', 'corporate', 'hybrid')),
  minimum_cognitive INT DEFAULT 50,
  work_style_requirements JSONB,
  -- Example: { "teamRole": "Leader", "communicationStyle": "Direct" }
  
  -- Metadata
  created_by TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for listing roles
CREATE INDEX idx_custom_roles_created_at ON custom_roles(created_at DESC);


-- =============================================
-- 3. Candidate Role Matches Table
-- Links candidates to roles with color ratings
-- =============================================
CREATE TABLE IF NOT EXISTS candidate_role_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  candidate_id UUID REFERENCES assessment_results(id) ON DELETE CASCADE,
  role_id UUID REFERENCES custom_roles(id) ON DELETE CASCADE,
  
  -- Match Scores
  fit_score INT CHECK (fit_score >= 0 AND fit_score <= 100),
  behavioral_score INT CHECK (behavioral_score >= 0 AND behavioral_score <= 100),
  
  -- Color Rating
  rating_color TEXT CHECK (rating_color IN ('green', 'blue', 'orange')),
  rating_label TEXT CHECK (rating_label IN ('PROCEED', 'PROBE', 'PASS')),
  rating_reason TEXT,
  
  -- AI Analysis
  ai_summary TEXT,
  interview_focus TEXT[],
  concerns TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one match per candidate-role pair
  UNIQUE (candidate_id, role_id)
);

-- Indexes for efficient querying
CREATE INDEX idx_matches_candidate ON candidate_role_matches(candidate_id);
CREATE INDEX idx_matches_role ON candidate_role_matches(role_id);
CREATE INDEX idx_matches_color ON candidate_role_matches(rating_color);


-- =============================================
-- 4. Row Level Security (RLS) - Optional
-- Uncomment if you want to enable RLS
-- =============================================

-- ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidate_role_matches ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow anonymous inserts for assessments
-- CREATE POLICY "Allow anonymous assessment submissions" 
--   ON assessment_results FOR INSERT 
--   TO anon 
--   WITH CHECK (true);


-- =============================================
-- 5. Helper Functions
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for custom_roles
CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- 6. Default Roles Table
-- Preset role profiles for scoring (replaces roles.json)
-- =============================================
CREATE TABLE IF NOT EXISTS default_roles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  
  -- Trait weights for scoring (must sum to 1.0)
  weights JSONB NOT NULL,
  -- Example: { "EXT": 0.22, "CON": 0.12, ... }
  
  -- Ideal trait scores
  ideal JSONB NOT NULL,
  -- Example: { "EXT": 75, "CON": 55, ... }
  
  -- Culture preference
  culture TEXT CHECK (culture IN ('startup', 'corporate', 'mixed')),
  
  -- Preferred work values
  values TEXT[],
  
  -- Work style preferences
  style JSONB,
  -- Example: { "teamRole": ["Leader", "Innovator"], "conflictStyle": ["Competing"] }
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active roles
CREATE INDEX idx_default_roles_active ON default_roles(is_active) WHERE is_active = TRUE;


-- =============================================
-- 7. Seed Default Roles
-- =============================================
INSERT INTO default_roles (id, title, weights, ideal, culture, values, style) VALUES
(
  'sales_executive',
  'Sales Executive',
  '{"EXT": 0.22, "RISK": 0.18, "EMO": 0.18, "CON": 0.12, "DEC": 0.10, "MOT": 0.10, "COG": 0.10}',
  '{"EXT": 75, "RISK": 65, "EMO": 70, "CON": 55, "DEC": 65, "MOT": 75, "COG": 55}',
  'mixed',
  ARRAY['autonomy', 'recognition', 'challenge'],
  '{"teamRole": ["Leader", "Innovator"], "conflictStyle": ["Competing", "Collaborating"]}'
),
(
  'backend_engineer',
  'Backend Engineer',
  '{"CON": 0.22, "COG": 0.25, "DEC": 0.15, "EMO": 0.15, "EXT": 0.08, "RISK": 0.08, "MOT": 0.07}',
  '{"CON": 75, "COG": 80, "DEC": 45, "EMO": 65, "EXT": 45, "RISK": 45, "MOT": 65}',
  'mixed',
  ARRAY['structure', 'stability', 'independence'],
  '{"teamRole": ["Executor", "Innovator"], "conflictStyle": ["Collaborating", "Avoiding"]}'
),
(
  'operations_manager',
  'Operations Manager',
  '{"CON": 0.25, "EMO": 0.22, "EXT": 0.18, "DEC": 0.12, "RISK": 0.10, "MOT": 0.08, "COG": 0.05}',
  '{"CON": 80, "EMO": 75, "EXT": 65, "DEC": 50, "RISK": 45, "MOT": 60, "COG": 60}',
  'corporate',
  ARRAY['structure', 'stability', 'collaboration'],
  '{"teamRole": ["Leader", "Supporter"], "conflictStyle": ["Collaborating", "Compromising"]}'
),
(
  'product_designer',
  'Product Designer',
  '{"MOT": 0.20, "COG": 0.20, "DEC": 0.18, "EXT": 0.15, "CON": 0.15, "RISK": 0.07, "EMO": 0.05}',
  '{"MOT": 75, "COG": 70, "DEC": 55, "EXT": 60, "CON": 65, "RISK": 60, "EMO": 65}',
  'startup',
  ARRAY['autonomy', 'challenge', 'collaboration'],
  '{"teamRole": ["Innovator", "Supporter"], "conflictStyle": ["Collaborating", "Compromising"]}'
),
(
  'data_analyst',
  'Data Analyst',
  '{"COG": 0.30, "CON": 0.25, "DEC": 0.15, "EMO": 0.12, "RISK": 0.08, "EXT": 0.05, "MOT": 0.05}',
  '{"COG": 85, "CON": 80, "DEC": 40, "EMO": 70, "RISK": 40, "EXT": 40, "MOT": 60}',
  'corporate',
  ARRAY['structure', 'security', 'independence'],
  '{"teamRole": ["Executor", "Supporter"], "conflictStyle": ["Avoiding", "Collaborating"]}'
),
(
  'startup_founder',
  'Startup Founder',
  '{"RISK": 0.25, "MOT": 0.22, "DEC": 0.18, "EXT": 0.15, "EMO": 0.10, "COG": 0.05, "CON": 0.05}',
  '{"RISK": 85, "MOT": 90, "DEC": 75, "EXT": 70, "EMO": 65, "COG": 65, "CON": 50}',
  'startup',
  ARRAY['autonomy', 'challenge', 'recognition'],
  '{"teamRole": ["Leader", "Innovator"], "conflictStyle": ["Competing", "Collaborating"]}'
)
ON CONFLICT (id) DO NOTHING;

