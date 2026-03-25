// ============================================================
// CV Data Loader - Direct YAML imports
// Single source of truth: data/ folder
// ============================================================

import type {
  CVGeneralInfo,
  CVTechnicalDomain,
  CVExperience,
  CVSelectedWork,
  CVSelectedWorkVisibility,
  CVEducation,
  CVCoursework,
  CVPublication,
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
}

interface YAMLConfig {
  cv_pdf_link: string;
}

interface YAMLQualifications {
  native_language: string;
  fluent_languages: string[];
  professional_language: string[];
  programming: string[];
  tools: string[];
  skills: string[];
}

interface YAMLExperience {
  company: string;
  start: string;
  end: string;
  title: string;
  promotion?: string;
  location: string;
  programming: string[];
  tools: string[];
  skills: string[];
  description: string;
  id: number;
}

interface YAMLEducation {
  university: string;
  name: string;
  location: string;
  degree: string;
  year: number;
  specialization: string;
  thesis: string;
  programming: string[];
  tools: string[];
  skills: string[];
  id: number;
}

interface YAMLProject {
  header: string;
  slug: string;
  description: string;
  introduction: string | null;
  programming: string[];
  tools: string[];
  skills: string[];
  experience_id: number | null;
  education_id: number | null;
  visibility: string;
  features: string[];
  tech_stack: string[];
  link: string | null;
  color: string;
  image_name: string | null;
  id: number;
}

interface YAMLCoursework {
  education_id: number;
  courses: string[];
}

// ============================================================
// Import YAML files using Vite glob imports
// ============================================================

const generalModules = import.meta.glob("@data/general/*.yaml", { eager: true });
const experienceModules = import.meta.glob("@data/experience/*.yaml", { eager: true });
const educationModules = import.meta.glob("@data/education/*.yaml", { eager: true });
const projectModules = import.meta.glob("@data/projects/*.yaml", { eager: true });
const courseworkModules = import.meta.glob("@data/coursework/*.yaml", { eager: true });

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
      title: "Unknown",
      summary: null,
      email: null,
      linkedin: null,
      github: null,
      location: null,
      last_compiled: null,
      cv_pdf_link: config?.cv_pdf_link || null,
    };
  }

  return {
    id: generateId(),
    title: info.identity,
    summary: info.description,
    email: info.email,
    linkedin: info.linkedin ? `linkedin.com/in/${info.linkedin}` : null,
    github: info.github ? `github.com/${info.github}` : null,
    location: null,
    last_compiled: new Date().toISOString(),
    cv_pdf_link: config?.cv_pdf_link || null,
  };
}

// ============================================================
// Process Qualifications → Technical Domains
// ============================================================

function processQualifications(): CVTechnicalDomain[] {
  const qual = getYamlByFilename<YAMLQualifications>(generalModules, "qualifications.yaml");
  if (!qual) return [];

  const domains: CVTechnicalDomain[] = [];

  // Programming → type: "language"
  qual.programming.forEach((skill, idx) => {
    domains.push({
      id: generateId(),
      type: "language",
      skill,
      is_highlighted: idx < 4,
      order_index: idx,
    });
  });

  // Tools → type: "tool"
  qual.tools.forEach((skill, idx) => {
    domains.push({
      id: generateId(),
      type: "tool",
      skill,
      is_highlighted: idx < 3,
      order_index: idx,
    });
  });

  // Skills → type: "skill"
  qual.skills.forEach((skill, idx) => {
    domains.push({
      id: generateId(),
      type: "skill",
      skill,
      is_highlighted: true,
      order_index: idx,
    });
  });

  return domains;
}

// ============================================================
// Process Experience
// ============================================================

function processExperience(): CVExperience[] {
  const rawExperiences = extractYamlData<YAMLExperience>(experienceModules);

  return rawExperiences
    .sort((a, b) => b.id - a.id) // Sort by id descending (most recent first)
    .map((exp, idx) => ({
      id: `exp-${exp.id}`,
      company: exp.company,
      role: exp.title,
      period: `${exp.start} – ${exp.end}`,
      description: exp.description.trim(),
      full_description: exp.description.trim(),
      location: exp.location,
      order_index: idx,
      skills: [...(exp.programming || []), ...(exp.tools || []), ...(exp.skills || [])],
      programming_skills: exp.programming || [],
      tool_skills: exp.tools || [],
      domain_skills: exp.skills || [],
    }));
}

// ============================================================
// Process Education
// ============================================================

function processEducation(): CVEducation[] {
  const rawEducation = extractYamlData<YAMLEducation>(educationModules);
  const rawCoursework = extractYamlData<YAMLCoursework>(courseworkModules);

  return rawEducation
    .sort((a, b) => b.year - a.year) // Sort by year descending
    .map((edu, idx) => {
      // Find coursework for this education
      const eduCoursework = rawCoursework.find((c) => c.education_id === edu.id);
      const courses = eduCoursework?.courses || [];

      return {
        id: `edu-${edu.id}`,
        institution: edu.university,
        degree: `${edu.degree} ${edu.name}`,
        specialization: edu.specialization || null,
        year: edu.year,
        thesis: edu.thesis === "unfinished" ? null : edu.thesis,
        honours: null,
        full_description: edu.thesis === "unfinished" ? null : edu.thesis,
        coursework: courses,
        location: edu.location,
        order_index: idx,
        programming_skills: edu.programming || [],
        tool_skills: edu.tools || [],
        domain_skills: edu.skills || [],
      };
    });
}

// ============================================================
// Process Projects → Selected Work
// ============================================================

function processProjects(): CVSelectedWork[] {
  const rawProjects = extractYamlData<YAMLProject>(projectModules);

  return rawProjects.map((proj, idx) => ({
    id: `proj-${proj.id}`,
    title: proj.header,
    description: proj.description,
    link: proj.link,
    color: proj.color,
    slug: proj.slug,
    // Combine all skill categories into tags for display
    tags: [
      ...(proj.programming || []),
      ...(proj.tools || []),
      ...(proj.skills || []),
    ],
    full_description: proj.introduction,
    image_name: proj.image_name || null,
    features: proj.features,
    tech_stack: proj.tech_stack,
    order_index: idx,
    related_experience_id: proj.experience_id ? `exp-${proj.experience_id}` : null,
    related_education_id: proj.education_id ? `edu-${proj.education_id}` : null,
    visibility: proj.visibility as CVSelectedWorkVisibility,
    programming_skills: proj.programming || [],
    tool_skills: proj.tools || [],
    domain_skills: proj.skills || [],
  }));
}

// ============================================================
// Process Coursework
// ============================================================

function processCoursework(): CVCoursework[] {
  const rawCoursework = extractYamlData<YAMLCoursework>(courseworkModules);
  const result: CVCoursework[] = [];

  rawCoursework.forEach((cw) => {
    cw.courses.forEach((course, idx) => {
      result.push({
        id: generateId(),
        education_id: `edu-${cw.education_id}`,
        name: course,
        technical_domain: null,
        technical_domain_item: null,
        order_index: idx,
      });
    });
  });

  return result;
}

// ============================================================
// Exported Data (same shape as old cv-data.ts)
// ============================================================

export const generalInfo: CVGeneralInfo = processGeneralInfo();
export const technicalDomains: CVTechnicalDomain[] = processQualifications();
export const experience: CVExperience[] = processExperience();
export const education: CVEducation[] = processEducation();
export const selectedWork: CVSelectedWork[] = processProjects();
export const coursework: CVCoursework[] = processCoursework();
export const publications: CVPublication[] = []; // No publications in YAML yet
