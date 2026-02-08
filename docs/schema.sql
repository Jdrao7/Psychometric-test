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
