import { Link } from "react-router-dom";
import GeometricBackground from "@/components/GeometricBackground";
import {
  useCVGeneralInfo,
  useCVTechnicalDomains,
  useCVExperience,
  useCVEducation,
  useCVOrganizations,
  getHighlightedSkillsByType,
  type CVExperience,
  type CVOrganization,
} from "@/hooks/use-cv-data";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function parseEndDate(end: string): Date {
  if (end.toLowerCase() === "present") return new Date(9999, 11);
  const d = new Date(end);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

interface ExperienceGroup {
  organization: CVOrganization | null;
  period: string;
  endDate: Date;
  roles: CVExperience[];
}

function groupExperiences(
  experiences: CVExperience[],
  organizations: CVOrganization[]
): ExperienceGroup[] {
  const orgMap = new Map(organizations.map((o) => [o.id, o]));

  // Sort by end date descending first
  const sorted = [...experiences].sort(
    (a, b) => parseEndDate(b.period.split("–")[1]?.trim() ?? b.period).getTime()
      - parseEndDate(a.period.split("–")[1]?.trim() ?? a.period).getTime()
  );

  const groups = new Map<string, ExperienceGroup>();

  for (const exp of sorted) {
    const key = `${exp.organization_id ?? "none"}::${exp.period}`;
    if (!groups.has(key)) {
      groups.set(key, {
        organization: exp.organization_id ? (orgMap.get(exp.organization_id) ?? null) : null,
        period: exp.period,
        endDate: parseEndDate(exp.period.split("–")[1]?.trim() ?? exp.period),
        roles: [],
      });
    }
    groups.get(key)!.roles.push(exp);
  }

  return [...groups.values()].sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
}

// -------------------------------------------------------
// Page
// -------------------------------------------------------

const CV = () => {
  const { data: generalInfo, isLoading: loadingInfo } = useCVGeneralInfo();
  const { data: technicalDomains, isLoading: loadingDomains } = useCVTechnicalDomains();
  const { data: experience, isLoading: loadingExperience } = useCVExperience();
  const { data: education, isLoading: loadingEducation } = useCVEducation();
  const { data: organizations, isLoading: loadingOrgs } = useCVOrganizations();

  const isLoading = loadingInfo || loadingDomains || loadingExperience || loadingEducation || loadingOrgs;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const highlightedOrgs = (organizations ?? [])
    .filter((o) => o.highlight_order !== null)
    .sort((a, b) => (a.highlight_order ?? 0) - (b.highlight_order ?? 0));

  const experienceGroups = groupExperiences(experience ?? [], organizations ?? []);

  const coreExpertise = technicalDomains ? getHighlightedSkillsByType(technicalDomains, "core_expertise") : [];
  const mathFoundation = technicalDomains ? getHighlightedSkillsByType(technicalDomains, "mathematical_foundation") : [];
  const implStack = technicalDomains ? getHighlightedSkillsByType(technicalDomains, "implementation_stack") : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />

      <main className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">

        {/* ── Highlighted org logos ── */}
        {highlightedOrgs.length > 0 && (
          <div className="mb-14 fade-in-section">
            <div className="flex flex-wrap items-center gap-10">
              {highlightedOrgs.map((org) =>
                org.logo ? (
                  <img
                    key={org.id}
                    src={org.logo}
                    alt={org.name}
                    title={org.name}
                    className="h-8 object-contain opacity-50 hover:opacity-80 transition-opacity duration-300"
                  />
                ) : (
                  <span key={org.id} className="text-sm font-medium text-muted-foreground">
                    {org.name}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <header className="mb-10 fade-in-section" style={{ animationDelay: "0.06s" }}>
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-2">
                Andreas Plenge
              </h1>
              <p className="text-base text-primary font-medium tracking-widest uppercase">
                {generalInfo?.title ?? "Software Engineer"}
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors self-start mt-2"
            >
              Contact
            </Link>
          </div>
        </header>

        {/* ── Summary ── */}
        {generalInfo?.summary && (
          <div className="mb-16 fade-in-section" style={{ animationDelay: "0.12s" }}>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-line">
              {generalInfo.summary}
            </p>
          </div>
        )}

        {/* ── Experience ── */}
        {experienceGroups.length > 0 && (
          <Section title="Experience" delay="0.20s">
            <div className="space-y-10">
              {experienceGroups.map((group, i) => (
                <ExperienceGroupCard key={i} group={group} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        {education && education.length > 0 && (
          <Section title="Education" delay="0.28s">
            <div className="space-y-6">
              {education.map((edu) => {
                const org = (organizations ?? []).find((o) => o.id === edu.organization_id);
                return (
                  <Link
                    key={edu.id}
                    to={`/education/${edu.id}`}
                    className="group flex items-start gap-5 p-5 border border-border hover:border-primary/30 bg-card transition-all duration-300"
                  >
                    {org?.logo && (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-8 w-8 object-contain opacity-50 group-hover:opacity-80 transition-opacity mt-0.5 flex-shrink-0 dark:invert"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {edu.degree}
                            {edu.specialization && (
                              <span className="font-normal text-muted-foreground">
                                {" "}· {edu.specialization}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{edu.institution}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider flex-shrink-0">
                          {edu.year}
                        </span>
                      </div>
                      {edu.short && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{edu.short}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Core Competencies ── */}
        {(coreExpertise.length > 0 || mathFoundation.length > 0 || implStack.length > 0) && (
          <Section title="Core Competencies" delay="0.34s">
            <div className="grid md:grid-cols-3 gap-8">
              {coreExpertise.length > 0 && (
                <SkillGroup label="Core Expertise" skills={coreExpertise} />
              )}
              {mathFoundation.length > 0 && (
                <SkillGroup label="Mathematical Foundation" skills={mathFoundation} />
              )}
              {implStack.length > 0 && (
                <SkillGroup label="Implementation Stack" skills={implStack} />
              )}
            </div>
          </Section>
        )}

        {/* ── Footer ── */}
        <footer className="mt-20 pt-8 border-t border-border flex justify-center fade-in-section">
          <img
            src="/sign.png"
            alt="Signature"
            className="h-14 opacity-40 hover:opacity-60 transition-opacity duration-500"
          />
        </footer>
      </main>
    </div>
  );
};

// -------------------------------------------------------
// Sub-components
// -------------------------------------------------------

const Section = ({
  title,
  delay,
  children,
}: {
  title: string;
  delay?: string;
  children: React.ReactNode;
}) => (
  <section className="mb-16 fade-in-section" style={{ animationDelay: delay }}>
    <div className="flex items-center gap-4 mb-7">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary whitespace-nowrap">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
    {children}
  </section>
);

const ExperienceGroupCard = ({ group }: { group: ExperienceGroup }) => {
  const org = group.organization;
  const [start, end] = group.period.split("–").map((s) => s.trim());

  return (
    <div className="flex items-start gap-5">
      {/* Logo column */}
      <div className="flex-shrink-0 w-10 pt-0.5">
        {org?.logo ? (
          <img
            src={org.logo}
            alt={org.name}
            className="h-8 w-8 object-contain opacity-50 dark:invert"
          />
        ) : (
          <div className="h-8 w-8 rounded-sm bg-border/40" />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-4 mb-3 flex-wrap">
          <p className="text-sm font-semibold text-foreground">
            {org?.name ?? "—"}
          </p>
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider flex-shrink-0">
            {start} — {end}
          </span>
        </div>

        <div className="space-y-4 pl-0 border-l border-border/50 ml-0 pl-4">
          {group.roles.map((role) => (
            <Link
              key={role.id}
              to={`/experience/${role.id}`}
              className="group block"
            >
              <p className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                {role.role}
              </p>
              {role.short && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {role.short}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkillGroup = ({ label, skills }: { label: string; skills: string[] }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
      {label}
    </p>
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

export default CV;
