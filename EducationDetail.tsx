import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import GeometricBackground from "@/components/GeometricBackground";
import { useCVEducationById } from "@/hooks/use-cv-data";

const EducationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: education, isLoading } = useCVEducationById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">// Loading...</p>
      </div>
    );
  }

  if (!education) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">// Education not found</p>
          <Link to="/" className="text-primary hover:underline">
            ← Front Page
          </Link>
        </div>
      </div>
    );
  }

  // Collect categorized skills from related projects
  const projectProgramming = education.related_projects.flatMap(
    (p) => p.programming_skills || []
  );
  const projectTools = education.related_projects.flatMap(
    (p) => p.tool_skills || []
  );
  const projectDomainSkills = education.related_projects.flatMap(
    (p) => p.domain_skills || []
  );

  const categorizedTags = {
    programming: [...new Set(projectProgramming)],
    tools: [...new Set(projectTools)],
    skills: [...new Set(projectDomainSkills)],
  };

  // Education's own skills (from YAML)
  const eduProgramming = (education as any).programming_skills || [];
  const eduTools = (education as any).tool_skills || [];
  const eduSkills = (education as any).domain_skills || [];

  // ---- COMBINE EVERYTHING INTO ONE TECH STACK ----
  const combinedProgramming = [
    ...new Set([...categorizedTags.programming, ...eduProgramming]),
  ];

  const combinedTools = [
    ...new Set([...categorizedTags.tools, ...eduTools]),
  ];

  const combinedSkills = [
    ...new Set([...categorizedTags.skills, ...eduSkills]),
  ];

  const hasCombinedStack =
    combinedProgramming.length > 0 ||
    combinedTools.length > 0 ||
    combinedSkills.length > 0;

  // Calculate section indices dynamically
  let sectionIndex = 0;
  const getNextIndex = () => {
    sectionIndex++;
    return sectionIndex < 10 ? `0${sectionIndex}` : `${sectionIndex}`;
  };

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
            EDUCATION
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
            {education.degree}
          </h1>
          <p className="text-xl text-muted-foreground font-light mb-2">
            {education.institution}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">{education.year}</span>
            </div>
            {education.location && (
              <span className="font-mono">{education.location}</span>
            )}
            {education.honours && (
              <span className="font-mono">{education.honours}</span>
            )}
          </div>
          {education.specialization && (
            <p className="text-muted-foreground">
              <span className="font-mono text-xs text-muted-foreground">
                Specialization:{" "}
              </span>
              {education.specialization}
            </p>
          )}
          {education.thesis && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              <span className="font-mono text-xs text-muted-foreground">
                Thesis:{" "}
              </span>
              {education.thesis}
            </p>
          )}
        </header>

        {/* Related Projects */}
        {education.related_projects.length > 0 && (
          <Section title="Projects" index={getNextIndex()}>
            <div className="grid md:grid-cols-2 gap-6">
              {education.related_projects.map((project) => (
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
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-muted-foreground"
                        >
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

        {/* Coursework */}
        {education.structured_coursework &&
          education.structured_coursework.length > 0 && (
            <Section title="Coursework" index={getNextIndex()}>
              <ul className="space-y-2">
                {education.structured_coursework.map((course) => (
                  <li
                    key={course.id}
                    className="text-muted-foreground font-mono text-sm"
                  >
                    {course.name}
                  </li>
                ))}
              </ul>
            </Section>
          )}

        {/* ---- SINGLE MERGED TECHNICAL STACK SECTION ---- */}
        {hasCombinedStack && (
          <Section title="Technical Stack" index={getNextIndex()}>
            <div className="grid md:grid-cols-2 gap-8">
              {combinedProgramming.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">
                    PROGRAMMING
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {combinedProgramming.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {combinedTools.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">
                    TOOLS & FRAMEWORKS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {combinedTools.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {combinedSkills.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs text-muted-foreground mb-4">
                    SKILLS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {combinedSkills.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 border border-border text-sm font-mono hover:border-primary transition-colors"
                      >
                        {tag}
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

export default EducationDetail;
