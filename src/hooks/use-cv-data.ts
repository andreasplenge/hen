import { useQuery } from "@tanstack/react-query";
import {
  generalInfo,
  technicalDomains,
  experience,
  education,
  publications,
  organizations,
} from "@/lib/cv-loader";

export interface CVGeneralInfo {
  id: string;
  title: string;
  summary: string | null;
  email: string | null;
  phone_number: string | null;
  linkedin: string | null;
  github: string | null;
  location: string | null;
  last_compiled: string | null;
  cv_pdf_link: string | null;
  other_websites: string[];
}

export type TechnicalDomainType = 'core_expertise' | 'mathematical_foundation' | 'implementation_stack';

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
  short: string | null;
  description: string | null;
  full_description: string | null;
  location: string | null;
  order_index: number;
  skills: string[];
  core_expertise_skills: string[];
  mathematical_foundation_skills: string[];
  implementation_stack_skills: string[];
  organization_id: string | null;
}

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  specialization: string | null;
  year: number;
  thesis: string | null;
  honours: string | null;
  short: string | null;
  description: string | null;
  full_description: string | null;
  location: string | null;
  order_index: number;
  core_expertise_skills: string[];
  mathematical_foundation_skills: string[];
  implementation_stack_skills: string[];
  organization_id: string | null;
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

export interface CVOrganization {
  id: string;
  name: string;
  logo: string | null;
  highlight_order: number | null;
}

// -----------------------------------------------------------
// Hooks
// -----------------------------------------------------------

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

export function useCVExperienceById(id: string | undefined) {
  return useQuery({
    queryKey: ["cv-experience", id],
    queryFn: async () => experience.find(e => e.id === id) ?? null,
    enabled: !!id,
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

export function useCVEducationById(id: string | undefined) {
  return useQuery({
    queryKey: ["cv-education", id],
    queryFn: async () => education.find(e => e.id === id) ?? null,
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useCVOrganizations() {
  return useQuery({
    queryKey: ["cv-organizations"],
    queryFn: async () => organizations,
    staleTime: Infinity,
  });
}

export function useCVOrganizationById(id: string | null | undefined) {
  return useQuery({
    queryKey: ["cv-organizations", id],
    queryFn: async () => organizations.find((o) => o.id === id) ?? null,
    enabled: !!id,
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
