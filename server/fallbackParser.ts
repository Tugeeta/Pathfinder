import { ParsedSecurityJob, SecurityDomains, AtsKeyword, HomeLabTask, DomainSkill } from '../src/types/securityJob.js';

export function parseSecurityJobFallback(rawText: string): ParsedSecurityJob {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Metadata Extraction
  let title = 'Entry-Level Security Analyst';
  let company = 'Target Organization';
  let location = 'United States';
  let workplaceType: 'Remote' | 'Hybrid' | 'On-site' | 'Not specified' = 'Not specified';
  let experienceLevel = 'Entry-Level (0-2 years)';

  const titleMatch = text.match(/(?:job title|position|role):\s*([^\n\r]+)/i) ||
    text.match(/^([^\n\r]*(?:analyst|engineer|responder|specialist)[^\n\r]*)/im);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim().replace(/^[-*•]\s*/, '');
  }

  const companyMatch = text.match(/(?:company|organization|employer):\s*([^\n\r]+)/i);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  } else {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 1 && !lines[1].toLowerCase().includes('location') && lines[1].length < 60) {
      company = lines[1].trim();
    }
  }

  const locationMatch = text.match(/(?:location|site):\s*([^\n\r]+)/i);
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim();
  }

  if (lower.includes('remote')) workplaceType = 'Remote';
  else if (lower.includes('hybrid')) workplaceType = 'Hybrid';
  else if (lower.includes('on-site') || lower.includes('onsite')) workplaceType = 'On-site';

  const expMatch = text.match(/(?:experience|level):\s*([^\n\r]+)/i) ||
    text.match(/(\d+[\s-]*\d*\s*years?(?:\s*of\s*experience)?)/i);
  if (expMatch && expMatch[1]) {
    experienceLevel = expMatch[1].trim();
  }

  // 2. Domain Categorization
  const siemSkills: DomainSkill[] = [];
  const networkSkills: DomainSkill[] = [];
  const iamSkills: DomainSkill[] = [];
  const irSkills: DomainSkill[] = [];
  const grcSkills: DomainSkill[] = [];

  // SIEM & Log Analysis
  if (lower.includes('splunk')) {
    siemSkills.push({
      skill: 'Splunk (SPL & Log Search)',
      subCategory: 'SIEM & Event Querying',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Hands-on familiarity with Splunk or SIEM log management platform',
      rationale: 'Primary platform used by enterprise SOCs for searching indices, building correlation alerts, and writing SPL queries.'
    });
  }
  if (lower.includes('sentinel') || lower.includes('microsoft sentinel')) {
    siemSkills.push({
      skill: 'Microsoft Sentinel (KQL)',
      subCategory: 'Cloud SIEM',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Microsoft Sentinel cloud detection and monitoring',
      rationale: 'High enterprise adoption in Azure environments; KQL query mastery is in high demand.'
    });
  }
  if (lower.includes('elastic') || lower.includes('elk') || lower.includes('kibana')) {
    siemSkills.push({
      skill: 'Elasticsearch & Kibana (ELK Stack)',
      subCategory: 'Open SIEM & Visualization',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Monitoring event logs using Elastic Security & Kibana',
      rationale: 'Widely used in security data pipelines and threat hunting.'
    });
  }
  if (lower.includes('windows event log') || lower.includes('sysmon') || lower.includes('syslog') || lower.includes('4624') || lower.includes('4625')) {
    siemSkills.push({
      skill: 'Windows Event Logs & Sysmon Telemetry',
      subCategory: 'Endpoint Telemetry',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Knowledge of Windows Event IDs (4624, 4625, 4688) and Sysmon process creation',
      rationale: 'Core foundation for entry-level analysts triaging authentication failures and process execution.'
    });
  }
  if (siemSkills.length === 0) {
    siemSkills.push({
      skill: 'Centralized Log Aggregation & SIEM Concepts',
      subCategory: 'SIEM Fundamentals',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Log analysis and alert triage across central security monitoring tools',
      rationale: 'Essential for cross-correlating multi-source audit trails during live incidents.'
    });
  }

  // Network Defense & Traffic Analysis
  if (lower.includes('wireshark') || lower.includes('pcap') || lower.includes('packet')) {
    networkSkills.push({
      skill: 'Wireshark & PCAP Deep Packet Inspection',
      subCategory: 'Traffic Analysis',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Basic packet analysis skills using Wireshark or tcpdump',
      rationale: 'Fundamental technical competency tested in SOC analyst technical interview loops.'
    });
  }
  if (lower.includes('suricata') || lower.includes('snort') || lower.includes('ids') || lower.includes('ips')) {
    networkSkills.push({
      skill: 'Suricata / Snort Network IDS Signatures',
      subCategory: 'Intrusion Detection',
      importance: 'Preferred',
      atsPriority: 'Medium',
      contextSnippet: 'Network intrusion detection sensors and rule triggers',
      rationale: 'Understanding how signature-based alerts fire enables accurate false-positive filtering.'
    });
  }
  if (lower.includes('zeek') || lower.includes('bro') || lower.includes('netflow')) {
    networkSkills.push({
      skill: 'Zeek (Bro) & NetFlow Metadata Analysis',
      subCategory: 'Network Protocol Telemetry',
      importance: 'Preferred',
      atsPriority: 'Medium',
      contextSnippet: 'Analyze network telemetry using Zeek and flow logs for lateral movement',
      rationale: 'Valuable for detecting beaconing and DNS exfiltration without decrypting payloads.'
    });
  }
  if (lower.includes('tcp/ip') || lower.includes('dns') || lower.includes('firewall')) {
    networkSkills.push({
      skill: 'TCP/IP Protocol Suite & Perimeter Firewalls',
      subCategory: 'Network Fundamentals',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Understanding of TCP/IP networking, DNS, HTTP/S, and common network ports',
      rationale: 'Non-negotiable foundational knowledge for validating legitimate vs malicious connections.'
    });
  }

  // Identity & Access Management (IAM)
  if (lower.includes('active directory') || lower.includes('kerberos') || lower.includes('ldap')) {
    iamSkills.push({
      skill: 'Active Directory & Kerberos Protocol Auditing',
      subCategory: 'Directory Services',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Review Active Directory audit logs for credential abuse, Kerberoasting, and password spraying',
      rationale: 'Active Directory is the primary attack surface targeted in enterprise ransomware campaigns.'
    });
  }
  if (lower.includes('azure ad') || lower.includes('entra') || lower.includes('okta') || lower.includes('sso')) {
    iamSkills.push({
      skill: 'Cloud IAM & Single Sign-On (Okta / Entra ID)',
      subCategory: 'Cloud Identity',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Enforcing SSO policies, MFA enforcement, and evaluating impossible travel alerts',
      rationale: 'Modern hybrid enterprises manage perimeter trust through identity providers.'
    });
  }
  if (lower.includes('least privilege') || lower.includes('rbac') || lower.includes('pam') || lower.includes('zero trust')) {
    iamSkills.push({
      skill: 'Role-Based Access Control (RBAC) & Least Privilege',
      subCategory: 'Access Governance',
      importance: 'Required',
      atsPriority: 'Medium',
      contextSnippet: 'Enforce principle of least privilege and role-based permissions',
      rationale: 'Critical defense-in-depth practice to contain breach blast radius.'
    });
  }

  // Incident Response & Triage
  if (lower.includes('phishing') || lower.includes('email header') || lower.includes('dmarc') || lower.includes('spf')) {
    irSkills.push({
      skill: 'Phishing Email Analysis & Mail Header Inspection',
      subCategory: 'Initial Access Triage',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Investigate suspicious email campaigns, analyze headers (SPF, DKIM, DMARC)',
      rationale: 'Phishing accounts for over 80% of initial access vectors faced by Tier 1 analysts daily.'
    });
  }
  if (lower.includes('mitre att&ck') || lower.includes('cyber kill chain') || lower.includes('ioc')) {
    irSkills.push({
      skill: 'MITRE ATT&CK Framework Mapping',
      subCategory: 'Threat Modeling',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Correlate suspicious activities against the MITRE ATT&CK enterprise matrix',
      rationale: 'Standard industry taxonomy used to document adversary tactics and write detection rules.'
    });
  }
  if (lower.includes('edr') || lower.includes('crowdstrike') || lower.includes('defender') || lower.includes('containment')) {
    irSkills.push({
      skill: 'EDR Alert Triage & Host Isolation (CrowdStrike/Defender)',
      subCategory: 'Endpoint Containment',
      importance: 'Preferred',
      atsPriority: 'High',
      contextSnippet: 'Triage endpoint alerts and execute rapid containment of compromised workstations',
      rationale: 'Directly impacts mean-time-to-contain (MTTC) during live incident escalations.'
    });
  }

  // Compliance & GRC
  if (lower.includes('nist') || lower.includes('nist csf') || lower.includes('800-53') || lower.includes('800-61') || lower.includes('800-171')) {
    grcSkills.push({
      skill: 'NIST Cybersecurity Framework (CSF) & SP 800 Series',
      subCategory: 'Security Frameworks',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: 'Incident response documentation conforming to NIST CSF and SP 800 standards',
      rationale: 'Gold-standard framework referenced by federal and commercial cybersecurity governance.'
    });
  }
  if (lower.includes('iso 27001') || lower.includes('soc 2') || lower.includes('audit')) {
    grcSkills.push({
      skill: 'SOC 2 Type II & ISO 27001 Evidence Collection',
      subCategory: 'Audit Assurance',
      importance: 'Preferred',
      atsPriority: 'Medium',
      contextSnippet: 'Assist with internal audits for SOC 2 Type II compliance and evidence gathering',
      rationale: 'High-value skill for demonstrating operational maturity in regulated industries.'
    });
  }
  if (lower.includes('hipaa') || lower.includes('pci-dss') || lower.includes('cmmc')) {
    const reg = lower.includes('hipaa') ? 'HIPAA Security Rule' : lower.includes('pci-dss') ? 'PCI-DSS' : 'CMMC Level 2';
    grcSkills.push({
      skill: `${reg} Regulatory Compliance`,
      subCategory: 'Industry Mandates',
      importance: 'Required',
      atsPriority: 'High',
      contextSnippet: `Adherence to ${reg} data security standards and incident disclosure rules`,
      rationale: 'Industry-specific compliance requirement protecting sensitive customer/patient records.'
    });
  }

  // Ensure every domain has at least one skill
  if (grcSkills.length === 0) {
    grcSkills.push({
      skill: 'Incident Logging Standards & Chain of Custody',
      subCategory: 'Security Policy',
      importance: 'Required',
      atsPriority: 'Medium',
      contextSnippet: 'Document forensic findings and maintain clean audit records',
      rationale: 'Ensures incident actions satisfy standard compliance and insurance reporting demands.'
    });
  }

  const domains: SecurityDomains = {
    siemAndLogAnalysis: siemSkills,
    networkDefenseAndTrafficAnalysis: networkSkills,
    identityAndAccessManagement: iamSkills,
    incidentResponseAndTriage: irSkills,
    complianceAndGrc: grcSkills,
  };

  // 3. ATS Keywords Generation
  const atsKeywords: AtsKeyword[] = [
    {
      keyword: 'SIEM Log Correlation (Splunk / Sentinel)',
      domain: 'SIEM & Log Analysis',
      priority: 'High',
      category: 'Tool',
      matchStrategy: 'Place prominently in Technical Skills section and mention specific SPL queries or KQL filters in experience bullets.',
      recommendedResumeBullet: 'Configured customized SIEM correlation queries to detect unauthorized PowerShell process injections (Event ID 4688), reducing alert false positives by 28%.'
    },
    {
      keyword: 'Wireshark Packet Analysis',
      domain: 'Network Defense & Traffic Analysis',
      priority: 'High',
      category: 'Tool',
      matchStrategy: 'Include under Networking Competencies and pair with TCP/IP protocol inspection or malicious beaconing detection.',
      recommendedResumeBullet: 'Conducted deep packet inspection on 15+ simulated intrusion PCAPs in Wireshark, isolating C2 DNS tunneling and suspicious TLS handshake anomalies.'
    },
    {
      keyword: 'Active Directory & Kerberos Security',
      domain: 'Identity & Access Management (IAM)',
      priority: 'High',
      category: 'Protocol / Standard',
      matchStrategy: 'Highlight under Identity & Systems administration; specifically name Event IDs 4624/4625 and brute-force detection.',
      recommendedResumeBullet: 'Audited Active Directory group policies and user account privileges, detecting simulated Kerberoasting attacks and enforcing least-privilege RBAC standards.'
    },
    {
      keyword: 'Incident Triage & MITRE ATT&CK',
      domain: 'Incident Response & Triage',
      priority: 'High',
      category: 'Methodology',
      matchStrategy: 'Reference in role summaries or project writeups by citing specific MITRE tactics (e.g. Initial Access T1566, Credential Access T1003).',
      recommendedResumeBullet: 'Triaged and documented over 40 simulated security alerts, mapping adversary behaviors directly to MITRE ATT&CK techniques in structured incident reports.'
    },
    {
      keyword: 'NIST Cybersecurity Framework (CSF)',
      domain: 'Compliance & GRC',
      priority: 'Medium',
      category: 'Protocol / Standard',
      matchStrategy: 'Mention in Core Competencies or alongside incident handling procedures (NIST SP 800-61).',
      recommendedResumeBullet: 'Standardized incident classification documentation aligned with NIST CSF lifecycle (Detect, Respond, Recover), accelerating tier-escalation handoffs.'
    },
    {
      keyword: 'Phishing Email Header Analysis (SPF/DKIM/DMARC)',
      domain: 'Incident Response & Triage',
      priority: 'Medium',
      category: 'Methodology',
      matchStrategy: 'Include under Email Security or Threat Triage with specific protocol authentications.',
      recommendedResumeBullet: 'Dissected raw RFC 822 email headers to verify SPF/DKIM/DMARC alignment, identifying spoofed domain headers and quarantining malicious payloads.'
    },
    {
      keyword: 'Sysmon Endpoint Telemetry',
      domain: 'SIEM & Log Analysis',
      priority: 'Medium',
      category: 'Tool',
      matchStrategy: 'Pair with Windows Event logging in your home lab or academic project portfolio.',
      recommendedResumeBullet: 'Deployed SwiftOnSecurity Sysmon configuration across Windows endpoints to capture high-fidelity process creation and network connection telemetry.'
    },
    {
      keyword: 'CompTIA Security+ / CySA+',
      domain: 'General Security',
      priority: 'High',
      category: 'Certification',
      matchStrategy: 'Place at top of resume beside contact details and in a dedicated Certifications section.',
      recommendedResumeBullet: 'CompTIA Security+ Certified (SY0-701) - Demonstrating validated competence in threat landscape analysis, cryptography, and network defense.'
    }
  ];

  // 4. Exactly 2 Tailored, Actionable Home Lab Tasks
  let lab1: HomeLabTask;
  let lab2: HomeLabTask;

  // Tailor Lab 1: Splunk + Sysmon Blue Team Detection Sandbox
  lab1 = {
    id: 'lab-splunk-sysmon',
    title: 'Enterprise SIEM & Endpoint Telemetry Detection Lab (Splunk + Sysmon)',
    primaryDomain: 'SIEM & Log Analysis',
    targetedSkills: ['Splunk SPL', 'Sysmon Configuration', 'Windows Event ID 4688/1', 'Adversary Technique Detection'],
    difficulty: 'Beginner',
    estimatedHours: '3-4 hours',
    objective: 'Deploy a local Windows 10/11 VM running Sysmon and forward telemetry to a free Splunk Enterprise instance. Execute a simulated adversary attack (encoded PowerShell download & execution) and craft custom SPL queries to detect and alert on the threat.',
    recommendedFreeTools: ['VirtualBox or VMware Workstation Player', 'Splunk Enterprise Free (500MB/day license)', 'Sysmon (Microsoft Sysinternals)', 'SwiftOnSecurity Sysmon Config'],
    prerequisites: ['Basic command line familiarity', 'Hypervisor installed (VirtualBox or VMware)'],
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Install Sysmon with Modular Detection Configuration',
        description: 'Download Sysmon from Microsoft Sysinternals and SwiftOnSecurity sysmonconfig.xml. Install Sysmon via administrative PowerShell.',
        commandOrConfig: 'sysmon.exe -i sysmonconfig-export.xml'
      },
      {
        stepNumber: 2,
        title: 'Install Splunk Free & Universal Forwarder',
        description: 'Install Splunk Enterprise on your host machine or Linux VM. Configure a receiving port (9997) and deploy the Splunk Universal Forwarder on the Windows VM to monitor "Microsoft-Windows-Sysmon/Operational" and "Security" channels.',
        commandOrConfig: './splunk enable listen 9997'
      },
      {
        stepNumber: 3,
        title: 'Simulate Adversary T1059.001 (Encoded PowerShell Execution)',
        description: 'Trigger a simulated benign attack using encoded PowerShell commands mimicking malicious dropper behavior.',
        commandOrConfig: 'powershell.exe -enc SQBuAHYAbwBrAGUALQBXAGUAYgBSAGUAcQB1AGUAcwB0ACAALQBVAHIAaQAgACIAaAB0AHQAcAA6AC8ALwAxADIANwAuADAALgAwAC4AMQAiAA=='
      },
      {
        stepNumber: 4,
        title: 'Write SPL Hunting Query & Build Alert Rule',
        description: 'Construct a search in Splunk to isolate process execution containing encoded commands or suspicious parent processes.',
        commandOrConfig: 'index=sysmon EventCode=1 (Image="*powershell.exe" CommandLine="*-enc*") | stats count by Computer, ParentImage, CommandLine'
      }
    ],
    verificationCriteria: 'Query in Splunk displays the exact execution timestamp, parent process (e.g. cmd.exe or explorer.exe), and decoded command string within 30 seconds of execution.',
    portfolioDeliverable: {
      format: 'GitHub Repository with Markdown Incident Report',
      whatToInclude: 'Architectural diagram of VM telemetry pipeline, annotated screenshots of Splunk search dashboard, sanitized SPL queries, and a 1-page detection engineering writeup.'
    }
  };

  // Tailor Lab 2: Wireshark Malicious Traffic & Phishing Header Dissection
  lab2 = {
    id: 'lab-pcap-traffic-analysis',
    title: 'Adversary C2 Beaconing & Malicious PCAP Triage Lab',
    primaryDomain: 'Network Defense & Traffic Analysis',
    targetedSkills: ['Wireshark Display Filters', 'TLS/DNS Inspection', 'HTTP Object Extraction', 'IOC Extraction & Incident Reporting'],
    difficulty: 'Beginner',
    estimatedHours: '2-3 hours',
    objective: 'Download an authentic malware traffic capture from Malware-Traffic-Analysis.net. Dissect DNS query volume, extract malicious binaries transmitted over cleartext HTTP, analyze certificate anomalies, and produce a professional SOC Tier 1 Incident Triage Report.',
    recommendedFreeTools: ['Wireshark', 'NetworkMiner (Free Edition)', 'VirusTotal / AbuseIPDB (Free lookups)', 'CyberChef'],
    prerequisites: ['Wireshark installed', 'Basic understanding of TCP three-way handshake and DNS queries'],
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Load Capture & Survey Protocol Hierarchy',
        description: 'Open the pcap file in Wireshark and navigate to Statistics > Protocol Hierarchy to identify which protocols dominate the capture.',
        commandOrConfig: 'Statistics -> Protocol Hierarchy'
      },
      {
        stepNumber: 2,
        title: 'Hunt for Malicious DNS Tunneling and DGA Domains',
        description: 'Apply display filters to inspect abnormal DNS query lengths, high-frequency TXT records, or non-existent domain (NXDOMAIN) responses.',
        commandOrConfig: 'dns.flags.response == 0 && dns.qry.name.len > 30'
      },
      {
        stepNumber: 3,
        title: 'Extract Payload via HTTP Stream & Hash Verification',
        description: 'Navigate to File > Export Objects > HTTP. Extract any downloaded executables or DLLs and generate SHA-256 hashes to cross-check on VirusTotal.',
        commandOrConfig: 'sha256sum suspicious_payload.exe'
      },
      {
        stepNumber: 4,
        title: 'Map Findings to MITRE ATT&CK & Produce Triage Report',
        description: 'Correlate infected IP, compromised hostname, C2 IP address, and payload hash. Document containment steps (firewall block, host quarantine).',
        commandOrConfig: 'MITRE ATT&CK: T1071.001 (Web Protocols), T1071.004 (DNS)'
      }
    ],
    verificationCriteria: 'Identification of the exact compromised host IP, the adversary C2 server IP/domain, the delivery payload SHA-256 hash, and root cause timeline documented in the triage report.',
    portfolioDeliverable: {
      format: 'PDF / Markdown SOC Triage Report on GitHub / LinkedIn',
      whatToInclude: 'Full IOC table (IPs, Domains, Hashes), Wireshark filter screenshots, MITRE ATT&CK mapping table, and recommended immediate containment actions.'
    }
  };

  return {
    metadata: {
      title,
      company,
      location,
      workplaceType,
      experienceLevel,
      employmentType: 'Full-Time',
      securityClearance: lower.includes('secret') || lower.includes('clearance') ? 'Secret Eligible' : 'Not required'
    },
    executiveSummary: `Targeting an entry-level defensive role at ${company}, this position prioritizes frontline SIEM alert monitoring, network packet analysis with Wireshark, and Active Directory user auditing. Candidates who demonstrate tangible hands-on lab experience using Splunk, Sysmon, and incident triage runbooks will stand out decisively against passive applicants.`,
    domains,
    atsKeywords,
    homeLabTasks: [lab1, lab2],
    parserVersion: 'Pathfind-v2.5',
    parsedAt: new Date().toISOString()
  };
}
