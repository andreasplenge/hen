import React from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Section = ({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <section className="mb-14">
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
        </div>
        {children}
    </section>
);

export const ExperienceItem = ({
    id,
    title,
    company,
    period,
    location
}: {
    id: string;
    title: string;
    company: string;
    period: string;
    location: string;
}) => (
    <Link
        to={`/experience/${id}`}
        className="group block bg-card border border-border hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300"
    >
        <div className="p-6 transition-colors duration-300">
            <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-sm">
                    {title} <span className="font-normal text-muted-foreground">at {company}</span>
                </h4>
                <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider block">{period}</span>
                    {location && <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider block">{location}</span>}
                </div>
            </div>
        </div>
    </Link>
);

export const EducationItem = ({
    id,
    degree,
    institution,
    year,
    location,
    specialization
}: {
    id: string;
    degree: string;
    institution: string;
    year: number;
    location?: string;
    specialization?: string;
}) => (
    <Link
        to={`/education/${id}`}
        className="group block bg-card border border-border hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300"
    >
        <div className="p-6 transition-colors duration-300">
            <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-sm">
                    {degree}
                    {specialization && (
                        <span className="font-normal text-muted-foreground"> specialized in {specialization}</span>
                    )}
                    <span className="font-normal text-muted-foreground"> at {institution}</span>
                </h4>
                <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider block">{year}</span>
                    {location && <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider block">{location}</span>}
                </div>
            </div>
        </div>
    </Link>
);

export const ProjectCard = ({
    title,
    description,
    affiliation,
    affiliationType,
    slug,
    subProjects = []
}: {
    title: string;
    description: string;
    affiliation: string | null;
    affiliationType: "company" | "education" | null;
    slug: string;
    subProjects?: string[];
}) => (
    <Link
        to={`/project/${slug}`}
        className="group block bg-card border border-border hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300"
    >
        <div className="p-6 transition-colors duration-300">
            <div className="mb-2.5">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-sm">{title}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{description}</p>

            {subProjects.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
                    {subProjects.map((sub, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            <span>{sub}</span>
                        </div>
                    ))}
                </div>
            )}

            {affiliation && (
                <div className="text-xs text-primary/70">
                    <span>{affiliation}</span>
                </div>
            )}
        </div>
    </Link>
);

export const SkillTag = ({
    skill,
    origins,
}: {
    skill: string;
    origins?: { projects: string[]; experience: string[]; education: string[] };
}) => {
    const hasOrigins = origins && (origins.projects.length > 0 || origins.experience.length > 0 || origins.education.length > 0);

    if (!hasOrigins) {
        return (
            <span className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground">
                {skill}
            </span>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground cursor-default hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                    {skill}
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-3 text-xs leading-relaxed">
                <p className="font-semibold mb-2">{skill}</p>
                {origins.projects.length > 0 && (
                    <div className="mb-2 last:mb-0">
                        <p className="text-primary font-medium mb-1">Projects:</p>
                        <ul className="list-none space-y-0.5">
                            {origins.projects.map((p, i) => (
                                <li key={i} className="text-muted-foreground flex gap-2">
                                    <span className="text-primary/50 text-[10px] mt-0.5">•</span>
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {origins.experience.length > 0 && (
                    <div className="mb-2 last:mb-0">
                        <p className="text-primary font-medium mb-1">Experience:</p>
                        <ul className="list-none space-y-0.5">
                            {origins.experience.map((e, i) => (
                                <li key={i} className="text-muted-foreground flex gap-2">
                                    <span className="text-primary/50 text-[10px] mt-0.5">•</span>
                                    <span>{e}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {origins.education.length > 0 && (
                    <div className="mb-2 last:mb-0">
                        <p className="text-primary font-medium mb-1">Education:</p>
                        <ul className="list-none space-y-0.5">
                            {origins.education.map((e, i) => (
                                <li key={i} className="text-muted-foreground flex gap-2">
                                    <span className="text-primary/50 text-[10px] mt-0.5">•</span>
                                    <span>{e}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </TooltipContent>
        </Tooltip>
    );
};
