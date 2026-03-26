// ============================================================
// CV Data Loader - Direct YAML imports
// Single source of truth: data/ folder
// ============================================================

import type {
  CVGeneralInfo,
  CVTechnicalDomain,
  CVExperience,
  CVEducation,
  CVPublication,
  CVOrganization,
} from "@/hooks/use-cv-data";

// ============================================================
// YAML Type Definitions (raw structure from YAML files)
// ============================================================

interface YAMLGeneralInfo {
  firstname: string;
  lastname: string;
  identity: string;
  description: string;
  email: string;
  linkedin: string;
  github: string;
  phone_number?: string;
  other_websites?: string[];
}

interface YAMLConfig {
  cv_pdf_link: string;
}

interface YAMLQualifications {
  native_language: string;
  fluent_languages: string[];
  professional_language: string[];
  core_expertise: string[];
  mathematical_foundation: string[];
  implementation_stack: string[];
}

interface YAMLExperience {
  start: string;
  end: string;
  title: string;
  promotion?: string;
  location: string;
  core_expertise: string[];
  mathematical_foundation: string[];
  implementation_stack: string[];
  short?: string;
  description: string;
  id: number;
  organization_id?: number;
}

interface YAMLEducation {
  name: string;
  location: string;
  degree: string;
  start_year?: number;
  year: number;
  specialization: string;
  thesis: string;
  short?: string;
  description?: string;
  core_expertise: string[];
  mathematical_foundation: string[];
  implementation_stack: string[];
  id: number;
  organization_id?: number;
}

interface YAMLOrganization {
  id: number;
  name: string;
  logo: string | null;
  highlight_order?: number;
}

// ============================================================
// Import YAML files using Vite glob imports
// ============================================================

const generalModules = import.meta.glob("@data/general/*.yaml", { eager: true });
const experienceModules = import.meta.glob("@data/experience/*.yaml", { eager: true });
const educationModules = import.meta.glob("@data/education/*.yaml", { eager: true });
const organizationModules = import.meta.glob("@data/organizations/*.yaml", { eager: true });

// ============================================================
// Helper functions
// ============================================================

function extractYamlData<T>(modules: Record<string, unknown>): T[] {
  return Object.values(modules).flatMap((m) => {
    const mod = m as { default: T[] };
    return mod.default || [];
  });
}

function getYamlByFilename<T>(modules: Record<string, unknown>, filename: string): T | null {
  const key = Object.keys(modules).find((k) => k.includes(filename));
  if (!key) return null;
  const mod = modules[key] as { default: T[] };
  return mod.default?.[0] || null;
}

let idCounter = 0;
function generateId(): string {
  return `gen-${++idCounter}`;
}

// ============================================================
// Process General Info
// ============================================================

function processGeneralInfo(): CVGeneralInfo {
  const info = getYamlByFilename<YAMLGeneralInfo>(generalModules, "information.yaml");
  const config = getYamlByFilename<YAMLConfig>(generalModules, "config.yaml");

  if (!info) {
    return {
      id: generateId(),
      name: "Unknown",
      title: "Unknown",
      summary: null,
      email: null,
      phone_number: null,
      linkedin: null,
      github: null,
      location: null,
      last_compiled: null,
      cv_pdf_link: config?.cv_pdf_link || null,
      other_websites: [],
    };
  }

  return {
    id: generateId(),
    name: `${info.firstname} ${info.lastname}`,
    title: info.identity,
    summary: info.description,
    email: info.email,
    phone_number: info.phone_number || null,
    linkedin: info.linkedin ? `linkedin.com/in/${info.linkedin}` : null,
    github: info.github ? `github.com/${info.github}` : null,
    location: null,
    last_compiled: new Date().toISOString(),
    cv_pdf_link: config?.cv_pdf_link || null,
    other_websites: info.other_websites || [],
  };
}

// ============================================================
// Process Qualifications → Technical Domains
// ============================================================

function processQualifications(): CVTechnicalDomain[] {
  const qual = getYamlByFilename<YAMLQualifications>(generalModules, "qualifications.yaml");
  if (!qual) return [];

  const domains: CVTechnicalDomain[] = [];

  qual.core_expertise.forEach((skill, idx) => {
    domains.push({ id: generateId(), type: "core_expertise", skill, is_highlighted: true, order_index: idx });
  });

  qual.mathematical_foundation.forEach((skill, idx) => {
    domains.push({ id: generateId(), type: "mathematical_foundation", skill, is_highlighted: true, order_index: idx });
  });

  qual.implementation_stack.forEach((skill, idx) => {
    domains.push({ id: generateId(), type: "implementation_stack", skill, is_highlighted: true, order_index: idx });
  });

  return domains;
}

// ============================================================
// Process Organizations
// ============================================================

function processOrganizations(): CVOrganization[] {
  const raw = extractYamlData<YAMLOrganization>(organizationModules);
  return raw.map((org) => ({
    id: `org-${org.id}`,
    name: org.name,
    logo: org.logo ? `${import.meta.env.BASE_URL}logos/${org.logo}` : null,
    highlight_order: org.highlight_order ?? null,
  }));
}

// ============================================================
// Process Experience
// ============================================================

function processExperience(): CVExperience[] {
  const rawExperiences = extractYamlData<YAMLExperience>(experienceModules);
  const rawOrganizations = extractYamlData<YAMLOrganization>(organizationModules);

  return rawExperiences
    .sort((a, b) => b.id - a.id)
    .map((exp, idx) => {
      const org = exp.organization_id != null
        ? rawOrganizations.find((o) => o.id === exp.organization_id) ?? null
        : null;
      return {
        id: `exp-${exp.id}`,
        company: org?.name ?? "",
        role: exp.title,
        period: `${exp.start} – ${exp.end}`,
        short: exp.short?.trim() || null,
        description: exp.description.trim(),
        full_description: exp.description.trim(),
        location: exp.location,
        order_index: idx,
        skills: [...(exp.core_expertise || []), ...(exp.mathematical_foundation || []), ...(exp.implementation_stack || [])],
        core_expertise_skills: exp.core_expertise || [],
        mathematical_foundation_skills: exp.mathematical_foundation || [],
        implementation_stack_skills: exp.implementation_stack || [],
        organization_id: exp.organization_id != null ? `org-${exp.organization_id}` : null,
      };
    });
}

// ============================================================
// Process Education
// ============================================================

function processEducation(): CVEducation[] {
  const rawEducation = extractYamlData<YAMLEducation>(educationModules);
  const rawOrganizations = extractYamlData<YAMLOrganization>(organizationModules);

  return rawEducation
    .sort((a, b) => b.year - a.year)
    .map((edu, idx) => {
      const org = edu.organization_id != null
        ? rawOrganizations.find((o) => o.id === edu.organization_id) ?? null
        : null;

      return {
        id: `edu-${edu.id}`,
        institution: org?.name ?? "",
        organization_id: edu.organization_id != null ? `org-${edu.organization_id}` : null,
        degree: `${edu.degree} ${edu.name}`,
        specialization: edu.specialization || null,
        start_year: edu.start_year ?? null,
        year: edu.year,
        thesis: edu.thesis === "unfinished" ? null : edu.thesis,
        honours: null,
        short: edu.short?.trim() || null,
        description: edu.description?.trim() || null,
        full_description: edu.thesis === "unfinished" ? null : edu.thesis,
        location: edu.location,
        order_index: idx,
        core_expertise_skills: edu.core_expertise || [],
        mathematical_foundation_skills: edu.mathematical_foundation || [],
        implementation_stack_skills: edu.implementation_stack || [],
      };
    });
}

// ============================================================
// Exported Data
// ============================================================

export const generalInfo: CVGeneralInfo = processGeneralInfo();
export const technicalDomains: CVTechnicalDomain[] = processQualifications();
export const experience: CVExperience[] = processExperience();
export const education: CVEducation[] = processEducation();
export const organizations: CVOrganization[] = processOrganizations();
export const publications: CVPublication[] = [];
