import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { parseSecurityJobFallback } from './server/fallbackParser.js';
import { ParsedSecurityJob } from './src/types/securityJob.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  app.post('/api/parse-job', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an unstructured security job description text to parse.',
      });
    }

    if (!ai) {
      const fallbackResult = parseSecurityJobFallback(text);
      return res.json({
        success: true,
        data: fallbackResult,
        source: 'rule_engine',
      });
    }

    try {
      const systemInstruction = `You are the Pathfind Security Parsing Engine. Your role is to take unstructured job postings for entry-level security analyst roles (e.g. SOC Analyst Tier 1, Incident Responder, Cyber Defense Analyst, Information Security Analyst) and convert them into rigorous, structured JSON data.

Rules you MUST strictly enforce:
1. Extract job metadata (title, company, location, workplaceType ['Remote', 'Hybrid', 'On-site', 'Not specified'], experienceLevel, employmentType, securityClearance).
2. Categorize required and preferred technical skills into exactly these 5 standard security domains:
   - "siemAndLogAnalysis" (SIEM & Log Analysis): e.g. Splunk, Sentinel, Elastic, Windows Event Logs (4624, 4625, 4688), Sysmon, Syslog, correlation rules.
   - "networkDefenseAndTrafficAnalysis" (Network Defense & Traffic Analysis): e.g. Wireshark, PCAP, TCP/IP, DNS, Suricata, Snort, Zeek, NetFlow, Firewalls.
   - "identityAndAccessManagement" (Identity & Access Management (IAM)): e.g. Active Directory, Kerberos, LDAP, Azure AD / Entra ID, Okta, RBAC, Least Privilege, MFA, SSO.
   - "incidentResponseAndTriage" (Incident Response & Triage): e.g. Phishing header analysis, EDR (CrowdStrike, Defender), MITRE ATT&CK, alert triage, incident lifecycle, containment.
   - "complianceAndGrc" (Compliance & GRC): e.g. NIST CSF, NIST SP 800-53 / 800-61, ISO 27001, SOC 2, HIPAA, PCI-DSS, CMMC, audit logging.
   For each skill, extract: skill, subCategory, importance ('Required', 'Preferred', 'Bonus'), atsPriority ('High', 'Medium', 'Low'), contextSnippet (quote from posting), and rationale.
3. Assign an ATS Keyword Optimization Priority (High, Medium, Low) across key tools, standards, and methodologies, with natural match strategies and copyable, quantified resume bullet points.
4. Generate exactly 2 actionable, practical home lab tasks tailored specifically to missing or high-value skills identified in the job description.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Please parse this entry-level security analyst job posting into structured JSON according to all 4 rules:\n\n${text}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metadata: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  workplaceType: {
                    type: Type.STRING,
                    enum: ['Remote', 'Hybrid', 'On-site', 'Not specified'],
                  },
                  experienceLevel: { type: Type.STRING },
                  employmentType: { type: Type.STRING },
                  securityClearance: { type: Type.STRING },
                },
                required: ['title', 'company', 'location', 'workplaceType', 'experienceLevel'],
              },
              executiveSummary: { type: Type.STRING },
              domains: {
                type: Type.OBJECT,
                properties: {
                  siemAndLogAnalysis: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        subCategory: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ['Required', 'Preferred', 'Bonus'] },
                        atsPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        contextSnippet: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ['skill', 'importance', 'atsPriority', 'contextSnippet', 'rationale'],
                    },
                  },
                  networkDefenseAndTrafficAnalysis: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        subCategory: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ['Required', 'Preferred', 'Bonus'] },
                        atsPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        contextSnippet: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ['skill', 'importance', 'atsPriority', 'contextSnippet', 'rationale'],
                    },
                  },
                  identityAndAccessManagement: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        subCategory: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ['Required', 'Preferred', 'Bonus'] },
                        atsPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        contextSnippet: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ['skill', 'importance', 'atsPriority', 'contextSnippet', 'rationale'],
                    },
                  },
                  incidentResponseAndTriage: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        subCategory: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ['Required', 'Preferred', 'Bonus'] },
                        atsPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        contextSnippet: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ['skill', 'importance', 'atsPriority', 'contextSnippet', 'rationale'],
                    },
                  },
                  complianceAndGrc: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        subCategory: { type: Type.STRING },
                        importance: { type: Type.STRING, enum: ['Required', 'Preferred', 'Bonus'] },
                        atsPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        contextSnippet: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ['skill', 'importance', 'atsPriority', 'contextSnippet', 'rationale'],
                    },
                  },
                },
                required: [
                  'siemAndLogAnalysis',
                  'networkDefenseAndTrafficAnalysis',
                  'identityAndAccessManagement',
                  'incidentResponseAndTriage',
                  'complianceAndGrc',
                ],
              },
              atsKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    domain: {
                      type: Type.STRING,
                      enum: [
                        'SIEM & Log Analysis',
                        'Network Defense & Traffic Analysis',
                        'Identity & Access Management (IAM)',
                        'Incident Response & Triage',
                        'Compliance & GRC',
                        'General Security',
                      ],
                    },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    category: {
                      type: Type.STRING,
                      enum: ['Tool', 'Protocol / Standard', 'Methodology', 'Certification'],
                    },
                    matchStrategy: { type: Type.STRING },
                    recommendedResumeBullet: { type: Type.STRING },
                  },
                  required: ['keyword', 'domain', 'priority', 'category', 'matchStrategy', 'recommendedResumeBullet'],
                },
              },
              homeLabTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    primaryDomain: { type: Type.STRING },
                    targetedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate'] },
                    estimatedHours: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    recommendedFreeTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                    prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                    stepByStepGuide: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          stepNumber: { type: Type.INTEGER },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          commandOrConfig: { type: Type.STRING },
                        },
                        required: ['stepNumber', 'title', 'description'],
                      },
                    },
                    verificationCriteria: { type: Type.STRING },
                    portfolioDeliverable: {
                      type: Type.OBJECT,
                      properties: {
                        format: { type: Type.STRING },
                        whatToInclude: { type: Type.STRING },
                      },
                      required: ['format', 'whatToInclude'],
                    },
                  },
                  required: [
                    'id',
                    'title',
                    'primaryDomain',
                    'targetedSkills',
                    'difficulty',
                    'estimatedHours',
                    'objective',
                    'recommendedFreeTools',
                    'prerequisites',
                    'stepByStepGuide',
                    'verificationCriteria',
                    'portfolioDeliverable',
                  ],
                },
              },
            },
            required: ['metadata', 'executiveSummary', 'domains', 'atsKeywords', 'homeLabTasks'],
          },
        },
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error('Empty response received from Gemini.');
      }

      const parsed: ParsedSecurityJob = JSON.parse(rawJson);
      parsed.parserVersion = 'Gemini-3.8-Flash-Pathfind';
      parsed.parsedAt = new Date().toISOString();

      return res.json({
        success: true,
        data: parsed,
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('[Pathfind Engine] Gemini parsing error:', err);
      const fallbackResult = parseSecurityJobFallback(text);
      return res.json({
        success: true,
        data: fallbackResult,
        source: 'rule_engine_fallback',
        errorNotice: err?.message || 'Error communicating with AI model, successfully parsed via local engine.',
      });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      engine: 'Pathfind Security Parsing Engine',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pathfind Engine] Running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Pathfind Engine] Fatal server startup error:', err);
  process.exit(1);
});
