import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Calendar } from "lucide-react";
import GeometricBackground from "@/components/GeometricBackground";
import { useCVExperienceById } from "@/hooks/use-cv-data";

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: experience, isLoading } = useCVExperienceById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">// Loading...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">// Experience not found</p>
          <Link to="/" className="text-primary hover:underline">
            ← Front Page
          </Link>
        </div>
      </div>
    );
  }

  // Use categorized skills directly from the data (no global matching)
  const categorizedSkills = {
    programming: experience.programming_skills || [],
    tools: experience.tool_skills || [],
    skills: experience.domain_skills || [],
  };

  // Also include skills from related projects
  const projectProgramming = experience.related_projects.flatMap((p) => p.programming_skills || []);
  const projectTools = experience.related_projects.flatMap((p) => p.tool_skills || []);
  const projectDomainSkills = experience.related_projects.flatMap((p) => p.domain_skills || []);

  const allCategorizedSkills = {
    programming: [...new Set([...categorizedSkills.programming, ...projectProgramming])],
    tools: [...new Set([...categorizedSkills.tools, ...projectTools])],
    skills: [...new Set([...categorizedSkills.skills, ...projectDomainSkills])],
  };

  const hasCategories =
    allCategorizedSkills.programming.length > 0 ||
    allCategorizedSkills.tools.length > 0 ||
    allCategorizedSkills.skills.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />

      <main className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Front Page
        </Link>

        {/* Header */}
        <header className="mb-12">
          <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">
            EXPERIENCE
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
            {experience.role}
          </h1>
          <p className="text-xl text-muted-foreground font-light mb-2">
            {experience.company}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">{experience.period}</span>
            </div>
            {experience.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-mono">{experience.location}</span>
              </div>
            )}
          </div>
          {experience.description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {experience.description}
            </p>
          )}
        </header>

        {/* Related Projects */}
        {experience.related_projects.length > 0 && (
          <Section title="Projects" index="01">
            <div className="grid md:grid-cols-2 gap-6">
              {experience.related_projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.slug || project.id}`}
                  className="group block p-5 border border-border hover:border-primary transition-all duration-300 hover:bg-accent/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-mono font-medium group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs font-mono text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Technical Stack - Combined from job skills AND project tags */}
        {hasCategories && (
          <Section title="Technical Stack" index={experience.related_projects.length > 0 ? "02" : "01"}>
            <div className="grid md:grid-cols-2 gap-8">
              {allCategorizedSkills.programming.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">PROGRAMMING</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategorizedSkills.programming.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {allCategorizedSkills.tools.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">TOOLS & FRAMEWORKS</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategorizedSkills.tools.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {allCategorizedSkills.skills.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">SKILLS</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategorizedSkills.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border">
          <p className="font-mono text-xs text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Front Page
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

const Section = ({
  title,
  index,
  children,
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

export default ExperienceDetail;
