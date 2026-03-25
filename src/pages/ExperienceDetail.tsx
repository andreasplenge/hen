import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GeometricBackground from "@/components/GeometricBackground";
import { useCVExperienceById } from "@/hooks/use-cv-data";

const ExperienceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: experience, isLoading } = useCVExperienceById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Experience not found</p>
          <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  const allCategorizedSkills = {
    core_expertise: experience.core_expertise_skills || [],
    mathematical_foundation: experience.mathematical_foundation_skills || [],
    implementation_stack: experience.implementation_stack_skills || [],
  };

  const hasCategories =
    allCategorizedSkills.core_expertise.length > 0 ||
    allCategorizedSkills.mathematical_foundation.length > 0 ||
    allCategorizedSkills.implementation_stack.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />

      <main className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <header className="mb-12 fade-in-section">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {experience.role}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {experience.company}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
            <span>{experience.period}</span>
            {experience.location && <span>{experience.location}</span>}
          </div>
          {experience.short && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-line">
              {experience.short}
            </p>
          )}
          {experience.short && experience.description && (
            <div className="mb-4" />
          )}
          {experience.description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-line">
              {experience.description}
            </p>
          )}
        </header>

        {experience.related_projects.length > 0 && (
          <Section title="Projects">
            <div className="grid md:grid-cols-2 gap-5">
              {experience.related_projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.slug || project.id}`}
                  className="group block bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-5">
                    <div className="mb-2">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{project.description}</p>
                    )}
                    {project.sub_projects && project.sub_projects.length > 0 && (
                      <div className="flex flex-col gap-y-1 mt-2">
                        {project.sub_projects.map((sub, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            <span>{sub}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {hasCategories && (
          <Section title="Technical Stack">
            <div className="grid md:grid-cols-3 gap-6">
              {allCategorizedSkills.core_expertise.length > 0 && (
                <SkillGroup label="Core Expertise" items={allCategorizedSkills.core_expertise} />
              )}
              {allCategorizedSkills.mathematical_foundation.length > 0 && (
                <SkillGroup label="Mathematical Foundation" items={allCategorizedSkills.mathematical_foundation} />
              )}
              {allCategorizedSkills.implementation_stack.length > 0 && (
                <SkillGroup label="Implementation Stack" items={allCategorizedSkills.implementation_stack} />
              )}
            </div>
          </Section>
        )}

        <footer className="mt-20 pt-8 border-t border-border flex justify-center">
          <img src="/sign.png" alt="Signature" className="h-14 opacity-50 hover:opacity-70 transition-opacity duration-500" />
        </footer>
      </main>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12 fade-in-section">
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
    {children}
  </section>
);

const SkillGroup = ({ label, items }: { label: string; items: string[] }) => (
  <div>
    <h4 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{label}</h4>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded">
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default ExperienceDetail;
