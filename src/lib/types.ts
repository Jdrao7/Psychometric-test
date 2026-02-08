// Type definitions for the psychometric test

export interface Question {
  id: number;
  type: 'likert' | 'mcq' | 'forced_choice' | 'scenario';
  trait: string;
  text: string;
  options: Option[];
  reverse?: boolean;
  correctAnswer?: string; // For cognitive questions
  category?: string; // Optional category for display
}

export interface Option {
  id: string;
  text: string;
  value?: number; // For likert
  scores?: Record<string, number>; // For multi-trait scoring
}

export interface TraitScores {
  EXT: number;
  CON: number;
  EMO: number;
  RISK: number;
  DEC: number;
  MOT: number;
  COG: number;
}

export interface WorkValues {
  primary: 'autonomy' | 'structure' | 'recognition' | 'stability' | 'challenge' | 'security' | 'collaboration' | 'independence';
  secondary: string;
}

export interface WorkStyle {
  teamRole: 'Leader' | 'Innovator' | 'Executor' | 'Supporter';
  conflictStyle: 'Competing' | 'Compromising' | 'Collaborating' | 'Avoiding';
  communicationStyle: 'Direct' | 'Analytical' | 'Expressive' | 'Diplomatic';
}

export interface CompositeInsights {
  cultureFit: { startup: number; corporate: number };
  remoteReadiness: number;
  careerPath: 'Leadership Track' | 'Expert Track';
  managementFit: string[];
}

export interface RoleFit {
  roleId: string;
  title: string;
  fitPercentage: number;
}

export interface AssessmentResult {
  id: string;
  createdAt: string;
  traits: TraitScores;
  workValues: WorkValues;
  workStyle: WorkStyle;
  compositeInsights: CompositeInsights;
  roleFits: RoleFit[];
  strengths: string[];
  riskAreas: string[];
  qualityMetrics: {
    consistency: number;
    avgResponseTime: number;
  };
}

export interface Response {
  questionId: number;
  optionId: string;
  responseTime: number; // milliseconds
}

export interface RoleProfile {
  id: string;
  title: string;
  weights: Record<string, number>;
  ideal: Record<string, number>;
  culture: 'startup' | 'corporate' | 'mixed';
  values: string[];
  style: {
    teamRole: string[];
    conflictStyle: string[];
  };
}

// Custom role created by recruiters
export interface CustomRole {
  id: string;
  title: string;
  description?: string;
  traitWeights: Record<string, number>;
  idealRanges: Record<string, { min: number; max: number }>;
  culturePreference: 'startup' | 'corporate' | 'hybrid';
  minimumCognitive: number;
  workStyleRequirements?: {
    teamRole?: string;
    communicationStyle?: string;
  };
  createdBy?: string;
  isAiGenerated: boolean;
  createdAt: Date;
}

// Candidate match result for a custom role
export interface CandidateMatch {
  id: string;
  candidateId: string;
  roleId: string;
  fitScore: number;
  behavioralScore: number;
  ratingColor: 'green' | 'blue' | 'orange';
  ratingLabel: 'PROCEED' | 'PROBE' | 'PASS';
  ratingReason: string;
  aiSummary?: string;
  interviewFocus?: string[];
  concerns?: string[];
  createdAt: Date;
}

// Trait range configuration for custom roles
export interface TraitRange {
  min: number;
  max: number;
}

