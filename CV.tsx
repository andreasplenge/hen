import { Linkedin, Mail, ExternalLink, MapPin, Github, Download } from "lucide-react";
import GeometricBackground from "@/components/GeometricBackground";
import { Link } from "react-router-dom";
import {
  useCVGeneralInfo,
  useCVTechnicalDomains,
  useCVExperience,
  useCVSelectedWork,
  useCVEducation,
  useCVPublications,
  getHighlightedSkillsByType,
} from "@/hooks/use-cv-data";

const CV = () => {
  const { data: generalInfo, isLoading: loadingInfo } = useCVGeneralInfo();
  const { data: technicalDomains, isLoading: loadingDomains } = useCVTechnicalDomains();
  const { data: experience, isLoading: loadingExperience } = useCVExperience();
  const { data: selectedWork, isLoading: loadingWork } = useCVSelectedWork();
  const { data: education, isLoading: loadingEducation } = useCVEducation();
  const { data: publications, isLoading: loadingPublications } = useCVPublications();

  const isLoading = loadingInfo || loadingDomains || loadingExperience || loadingWork || loadingEducation || loadingPublications;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">// Loading...</p>
      </div>
    );
  }

  const lastCompiled = generalInfo?.last_compiled 
    ? new Date(generalInfo.last_compiled).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Get skills from qualifications (highlighted ones)
  const qualLanguages = technicalDomains ? getHighlightedSkillsByType(technicalDomains, 'language') : [];
  const qualTools = technicalDomains ? getHighlightedSkillsByType(technicalDomains, 'tool') : [];
  const qualSkills = technicalDomains ? getHighlightedSkillsByType(technicalDomains, 'skill') : [];

  // Get skills from all experiences
  const expProgramming = experience?.flatMap(e => e.programming_skills || []) || [];
  const expTools = experience?.flatMap(e => e.tool_skills || []) || [];
  const expDomainSkills = experience?.flatMap(e => e.domain_skills || []) || [];

  // Get skills from all projects
  const projProgramming = selectedWork?.flatMap(p => p.programming_skills || []) || [];
  const projTools = selectedWork?.flatMap(p => p.tool_skills || []) || [];
  const projDomainSkills = selectedWork?.flatMap(p => p.domain_skills || []) || [];

  // Get skills from all education
  const eduProgramming = education?.flatMap(e => e.programming_skills || []) || [];
  const eduTools = education?.flatMap(e => e.tool_skills || []) || [];
  const eduDomainSkills = education?.flatMap(e => e.domain_skills || []) || [];

  // Combine and dedupe all skills
  const allProgramming = [...new Set([...qualLanguages, ...expProgramming, ...projProgramming, ...eduProgramming])];
  const allTools = [...new Set([...qualTools, ...expTools, ...projTools, ...eduTools])];
  const allSkills = [...new Set([...qualSkills, ...expDomainSkills, ...projDomainSkills, ...eduDomainSkills])];

  // Build sections array with only sections that have content
  const sections: { title: string; content: React.ReactNode }[] = [];

  if (generalInfo?.summary) {
    sections.push({
      title: "Summary",
      content: (
        <p className="text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-line">
          {generalInfo.summary}
        </p>
      ),
    });
  }

  if (experience && experience.length > 0) {
    sections.push({
      title: "Experience",
      content: (
        <div className="space-y-10">
          {experience.map((exp) => (
            <ExperienceItem
              key={exp.id}
              id={exp.id}
              title={exp.role}
              company={exp.company}
              period={exp.period}
              location={exp.location || ""}
              description={exp.description || ""}
            />
          ))}
        </div>
      ),
    });
  }

  // Filter to only show "selected_work" visibility on CV page
  const visibleSelectedWork = selectedWork?.filter((w) => w.visibility === "selected_work") || [];

  if (visibleSelectedWork.length > 0) {
    sections.push({
      title: "Selected Work",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          {visibleSelectedWork.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description || ""}
              tags={project.tags || []}
              slug={project.slug || project.id}
            />
          ))}
        </div>
      ),
    });
  }

  if (education && education.length > 0) {
    sections.push({
      title: "Education",
      content: (
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="group">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <div>
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-muted-foreground text-sm">{edu.institution}</p>
                  {edu.specialization && (
                    <p className="text-muted-foreground text-sm">
                      <span className="font-mono text-xs">Specialization:</span> {edu.specialization}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{edu.year}</span>
                  <Link
                    to={`/education/${edu.id}`}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              {edu.thesis && (
                <p className="text-sm text-muted-foreground">
                  Thesis: "{edu.thesis}"
                </p>
              )}
              {edu.honours && (
                <p className="text-sm text-muted-foreground">
                  {edu.honours}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  if (publications && publications.length > 0) {
    sections.push({
      title: "Publications",
      content: (
        <div className="space-y-4">
          {publications.map((pub) => (
            <div key={pub.id} className="group">
              <p className="text-sm">
                {pub.authors && <span className="text-muted-foreground">{pub.authors}</span>}{" "}
                "{pub.title}"
              </p>
              {pub.venue && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {pub.venue}{pub.year && ` · ${pub.year}`}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  const hasSkills = allProgramming.length > 0 || allTools.length > 0 || allSkills.length > 0;

  if (hasSkills) {
    sections.push({
      title: "Technical Stack",
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          {allProgramming.length > 0 && (
            <div>
              <h4 className="font-mono text-xs text-muted-foreground mb-4">PROGRAMMING</h4>
              <div className="flex flex-wrap gap-2">
                {allProgramming.map((lang) => (
                  <span key={lang} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-mono rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          {allTools.length > 0 && (
            <div>
              <h4 className="font-mono text-xs text-muted-foreground mb-4">TOOLS & FRAMEWORKS</h4>
              <div className="flex flex-wrap gap-2">
                {allTools.map((tool) => (
                  <span key={tool} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-mono rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {allSkills.length > 0 && (
            <div>
              <h4 className="font-mono text-xs text-muted-foreground mb-4">SKILLS</h4>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-mono rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />
      <main className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3">
                Andreas Plenge
              </h1>
              <p className="text-lg text-muted-foreground font-light">
                {generalInfo?.title || "Software Engineer"}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {generalInfo?.email && (
                <a href={`mailto:${generalInfo.email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="font-mono">{generalInfo.email}</span>
                </a>
              )}
              {generalInfo?.linkedin && (
                <a href={`https://${generalInfo.linkedin.replace(/^https?:\/\//, '')}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4" />
                  <span className="font-mono">{generalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {generalInfo?.github && (
                <a href={`https://${generalInfo.github.replace(/^https?:\/\//, '')}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Github className="w-4 h-4" />
                  <span className="font-mono">{generalInfo.github.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {generalInfo?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-mono">{generalInfo.location}</span>
                </div>
              )}
              {generalInfo?.cv_pdf_link && (
                <a 
                  href={generalInfo.cv_pdf_link} 
                  download 
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-mono">Download CV</span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Render sections with dynamic numbering */}
        {sections.map((section, idx) => (
          <Section key={section.title} title={section.title} index={String(idx + 1).padStart(2, '0')}>
            {section.content}
          </Section>
        ))}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border">
          <p className="font-mono text-xs text-muted-foreground text-center">
            Last updated {lastCompiled}
          </p>
        </footer>
      </main>
    </div>
  );
};

const Section = ({ 
  title, 
  index, 
  children 
}: { 
  title: string; 
  index: string; 
  children: React.ReactNode;
}) => (
  <section className="mb-16">
    <div className="flex items-baseline gap-4 mb-6">
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
      <h2 className="text-xl font-light tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
    {children}
  </section>
);

const ExperienceItem = ({
  id,
  title,
  company,
  period,
  location,
  description
}: {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
}) => (
  <div className="group">
    <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-muted-foreground">{company}</p>
      </div>
      <div className="text-right flex items-start gap-3">
        <div>
          <span className="font-mono text-sm text-muted-foreground block">{period}</span>
          {location && <span className="font-mono text-xs text-muted-foreground">{location}</span>}
        </div>
        <Link
          to={`/experience/${id}`}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
          title="View details"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
    {description && (
      <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
    )}
  </div>
);

const ProjectCard = ({
  title,
  description,
  tags,
  slug
}: {
  title: string;
  description: string;
  tags: string[];
  slug: string;
}) => (
  <Link 
    to={`/project/${slug}`}
    className="group block p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-soft-lg transition-all duration-300 bg-card"
  >
    <div className="flex items-start justify-between mb-3">
      <h4 className="font-mono font-medium group-hover:text-primary transition-colors">{title}</h4>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="text-xs font-mono text-muted-foreground">
          #{tag}
        </span>
      ))}
    </div>
  </Link>
);

export default CV;
