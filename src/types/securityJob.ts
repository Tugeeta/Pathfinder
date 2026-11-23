export type AtsPriority = 'High' | 'Medium' | 'Low';
export type SkillImportance = 'Required' | 'Preferred' | 'Bonus';

export interface JobMetadata {
  title: string;
  company: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site' | 'Not specified';
  experienceLevel: string; // e.g. "Entry-Level (0-2 years)"
  employmentType?: string; // e.g. "Full-time"
  securityClearance?: string; // e.g. "Secret eligible", "None", or "Not mentioned"
}

export interface DomainSkill {
  skill: string;
  subCategory?: string;
  importance: SkillImportance;
  atsPriority: AtsPriority;
  contextSnippet: string;
  rationale: string;
}

export interface SecurityDomains {
  siemAndLogAnalysis: DomainSkill[];
  networkDefenseAndTrafficAnalysis: DomainSkill[];
  identityAndAccessManagement: DomainSkill[];
  incidentResponseAndTriage: DomainSkill[];
  complianceAndGrc: DomainSkill[];
}

export interface AtsKeyword {
  keyword: string;
  domain: 'SIEM & Log Analysis' | 'Network Defense & Traffic Analysis' | 'Identity & Access Management (IAM)' | 'Incident Response & Triage' | 'Compliance & GRC' | 'General Security';
  priority: AtsPriority;
  category: 'Tool' | 'Protocol / Standard' | 'Methodology' | 'Certification';
  matchStrategy: string;
  recommendedResumeBullet: string;
}

export interface HomeLabStep {
  stepNumber: number;
  title: string;
  description: string;
  commandOrConfig?: string;
}

export interface HomeLabTask {
  id: string;
  title: string;
  primaryDomain: string;
  targetedSkills: string[];
  difficulty: 'Beginner' | 'Intermediate';
  estimatedHours: string;
  objective: string;
  recommendedFreeTools: string[];
  prerequisites: string[];
  stepByStepGuide: HomeLabStep[];
  verificationCriteria: string;
  portfolioDeliverable: {
    format: string;
    whatToInclude: string;
  };
}

export interface ParsedSecurityJob {
  metadata: JobMetadata;
  executiveSummary: string;
  domains: SecurityDomains;
  atsKeywords: AtsKeyword[];
  homeLabTasks: [HomeLabTask, HomeLabTask]; // Exactly 2 actionable home lab tasks
  parserVersion?: string;
  parsedAt: string;
}
