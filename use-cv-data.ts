import { useQuery } from "@tanstack/react-query";
import {
  generalInfo,
  technicalDomains,
  experience,
  selectedWork,
  education,
  coursework,
  publications,
} from "@/lib/cv-loader";

export interface CVGeneralInfo {
  id: string;
  title: string;
  summary: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  location: string | null;
  last_compiled: string | null;
  cv_pdf_link: string | null;
}

export type TechnicalDomainType = 'language' | 'tool' | 'skill';

export interface CVTechnicalDomain {
  id: string;
  type: TechnicalDomainType;
  skill: string;
  is_highlighted: boolean;
  order_index: number;
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string | null;
  full_description: string | null;
  location: string | null;
  order_index: number;
  skills: string[];
  programming_skills: string[];
  tool_skills: string[];
  domain_skills: string[];
}

export type CVSelectedWorkVisibility = 'selected_work' | 'work_page_project' | 'personal_document';

export interface CVSelectedWork {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  color: string | null;
  slug: string | null;
  tags: string[];
  full_description: string | null;
  image_name: string | null;
  features: string[];
  tech_stack: string[];
  order_index: number;
  related_experience_id: string | null;
  related_education_id: string | null;
  visibility: CVSelectedWorkVisibility;
  programming_skills: string[];
  tool_skills: string[];
  domain_skills: string[];
}

export interface CVSelectedWorkWithRelations extends CVSelectedWork {
  related_experience: CVExperience | null;
  related_education: CVEducation | null;
}

export interface CVCoursework {
  id: string;
  education_id: string;
  name: string;
  technical_domain: 'language' | 'tool' | 'skill' | null;
  technical_domain_item: string | null;
  order_index: number;
}

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  specialization: string | null;
  year: number;
  thesis: string | null;
  honours: string | null;
  full_description: string | null;
  coursework: string[];
  location: string | null;
  order_index: number;
  programming_skills: string[];
  tool_skills: string[];
  domain_skills: string[];
}

export interface CVPublication {
  id: string;
  title: string;
  authors: string | null;
  venue: string | null;
  year: number | null;
  link: string | null;
  order_index: number;
}

export function useCVGeneralInfo() {
  return useQuery({
    queryKey: ["cv-general-info"],
    queryFn: async () => generalInfo,
    staleTime: Infinity,
  });
}

export function useCVTechnicalDomains() {
  return useQuery({
    queryKey: ["cv-technical-domains"],
    queryFn: async () => technicalDomains,
    staleTime: Infinity,
  });
}

// Helper functions to work with technical domains
export function filterDomainsByType(domains: CVTechnicalDomain[], type: TechnicalDomainType): CVTechnicalDomain[] {
  return domains.filter(d => d.type === type);
}

export function getSkillsByType(domains: CVTechnicalDomain[], type: TechnicalDomainType): string[] {
  return domains.filter(d => d.type === type).map(d => d.skill);
}

export function getHighlightedSkillsByType(domains: CVTechnicalDomain[], type: TechnicalDomainType): string[] {
  return domains.filter(d => d.type === type && d.is_highlighted).map(d => d.skill);
}

export function getAllSkills(domains: CVTechnicalDomain[]): string[] {
  return domains.map(d => d.skill);
}

export function useCVExperience() {
  return useQuery({
    queryKey: ["cv-experience"],
    queryFn: async () => experience,
    staleTime: Infinity,
  });
}

export interface CVExperienceWithProjects extends CVExperience {
  related_projects: CVSelectedWork[];
}

export function useCVExperienceById(id: string | undefined) {
  return useQuery({
    queryKey: ["cv-experience", id],
    queryFn: async () => {
      if (!id) return null;
      
      const exp = experience.find(e => e.id === id);
      if (!exp) return null;

      // Get related projects (exclude personal_document visibility)
      const relatedProjects = selectedWork.filter(
        w => w.related_experience_id === id && w.visibility !== "personal_document"
      );

      return {
        ...exp,
        related_projects: relatedProjects,
      } as CVExperienceWithProjects;
    },
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useCVSelectedWork() {
  return useQuery({
    queryKey: ["cv-selected-work"],
    queryFn: async () => selectedWork,
    staleTime: Infinity,
  });
}

export function useCVSelectedWorkBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["cv-selected-work", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const work = selectedWork.find(w => w.slug === slug);
      if (!work) return null;

      // Get related experience and education
      const relatedExp = work.related_experience_id 
        ? experience.find(e => e.id === work.related_experience_id) || null
        : null;
      const relatedEdu = work.related_education_id
        ? education.find(e => e.id === work.related_education_id) || null
        : null;

      return {
        ...work,
        related_experience: relatedExp,
        related_education: relatedEdu,
      } as CVSelectedWorkWithRelations;
    },
    enabled: !!slug,
    staleTime: Infinity,
  });
}

export function useCVEducation() {
  return useQuery({
    queryKey: ["cv-education"],
    queryFn: async () => education,
    staleTime: Infinity,
  });
}

export interface CVEducationWithProjects extends CVEducation {
  related_projects: CVSelectedWork[];
  structured_coursework: CVCoursework[];
}

export function useCVEducationById(id: string | undefined) {
  return useQuery({
    queryKey: ["cv-education", id],
    queryFn: async () => {
      if (!id) return null;
      
      const edu = education.find(e => e.id === id);
      if (!edu) return null;

      // Get related projects (exclude personal_document visibility)
      const relatedProjects = selectedWork.filter(
        w => w.related_education_id === id && w.visibility !== "personal_document"
      );

      // Get structured coursework
      const structuredCoursework = coursework.filter(c => c.education_id === id);

      return {
        ...edu,
        related_projects: relatedProjects,
        structured_coursework: structuredCoursework,
      } as CVEducationWithProjects;
    },
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useCVCoursework(educationId: string | undefined) {
  return useQuery({
    queryKey: ["cv-coursework", educationId],
    queryFn: async () => {
      if (!educationId) return [];
      return coursework.filter(c => c.education_id === educationId);
    },
    enabled: !!educationId,
    staleTime: Infinity,
  });
}

export function useCVPublications() {
  return useQuery({
    queryKey: ["cv-publications"],
    queryFn: async () => publications,
    staleTime: Infinity,
  });
}
