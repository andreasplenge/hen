import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GeometricBackground from "@/components/GeometricBackground";
import {
  useCVGeneralInfo,
  useCVExperience,
  useCVEducation,
  useCVOrganizations,
  type CVExperience,
  type CVEducation,
  type CVOrganization,
} from "@/hooks/use-cv-data";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function extractYear(dateStr: string): string {
  if (dateStr.toLowerCase() === "present") return "Now";
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : dateStr;
}

function parseEndDate(end: string): Date {
  if (end.toLowerCase() === "present") return new Date(9999, 11);
  const d = new Date(end);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

interface EducationGroup {
  institution: string;
  organization_id: string | null;
  logo: string | null;
  entries: CVEducation[];
}

function groupEducation(entries: CVEducation[], organizations: CVOrganization[]): EducationGroup[] {
  const orgMap = new Map(organizations.map((o) => [o.id, o]));
  const map = new Map<string, EducationGroup>();
  const sorted = [...entries].sort((a, b) => b.year - a.year);
  for (const edu of sorted) {
    const key = edu.organization_id ?? edu.institution;
    if (!map.has(key)) {
      const org = edu.organization_id ? (orgMap.get(edu.organization_id) ?? null) : null;
      map.set(key, { institution: edu.institution, organization_id: edu.organization_id, logo: org?.logo ?? null, entries: [] });
    }
    map.get(key)!.entries.push(edu);
  }
  return [...map.values()];
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
  const groups = new Map<string, ExperienceGroup>();

  for (const exp of experiences) {
    const key = exp.organization_id ?? "none";
    if (!groups.has(key)) {
      groups.set(key, {
        organization: exp.organization_id ? (orgMap.get(exp.organization_id) ?? null) : null,
        period: exp.period,
        endDate: parseEndDate(exp.period.split("–")[1]?.trim() ?? exp.period),
        roles: [],
      });
    }
    const group = groups.get(key)!;
    group.roles.push(exp);
    // Expand period to cover all roles: earliest start, latest end
    const groupStart = group.period.split("–")[0].trim();
    const roleStart = exp.period.split("–")[0].trim();
    const groupEnd = group.period.split("–")[1]?.trim() ?? "";
    const roleEnd = exp.period.split("–")[1]?.trim() ?? "";
    const earlierStart = parseEndDate(groupStart) <= parseEndDate(roleStart) ? groupStart : roleStart;
    const laterEnd = parseEndDate(groupEnd) >= parseEndDate(roleEnd) ? groupEnd : roleEnd;
    group.period = `${earlierStart} – ${laterEnd}`;
    group.endDate = parseEndDate(laterEnd);
  }

  return [...groups.values()].sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
}

// -------------------------------------------------------
// Timeline hook
// -------------------------------------------------------

function useVisibleSections(ids: string[]): Set<string> {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!ids.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (entry.isIntersecting) next.add(entry.target.id);
            else next.delete(entry.target.id);
          }
          return next;
        });
      },
      { threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      if (nearBottom) setVisibleIds((prev) => new Set([...prev, ids[ids.length - 1]]));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ids]);

  return visibleIds;
}

// -------------------------------------------------------
// Page
// -------------------------------------------------------

const CV = () => {
  const { data: generalInfo, isLoading: loadingInfo } = useCVGeneralInfo();
  const { data: experience, isLoading: loadingExperience } = useCVExperience();
  const { data: education, isLoading: loadingEducation } = useCVEducation();
  const { data: organizations, isLoading: loadingOrgs } = useCVOrganizations();

  const isLoading = loadingInfo || loadingExperience || loadingEducation || loadingOrgs;

  // Must be computed before any early return so hooks are always called unconditionally
  const highlightedOrgs = (organizations ?? [])
    .filter((o) => o.highlight_order !== null)
    .sort((a, b) => (a.highlight_order ?? 0) - (b.highlight_order ?? 0));

  const experienceGroups = groupExperiences(experience ?? [], organizations ?? []);
  const educationGroups = groupEducation(education ?? [], organizations ?? []);

  const timelineItems = [
    ...experienceGroups.map((g) => {
      const [s, e] = g.period.split("–").map((x) => x.trim());
      return {
        id: `tl-exp-${g.organization?.id ?? "none"}`,
        label: g.organization?.name ?? "—",
        years: `${extractYear(s)} – ${extractYear(e)}`,
      };
    }),
    ...educationGroups.map((g) => {
      const minStart = g.entries.reduce((min, e) => Math.min(min, e.start_year ?? e.year), Infinity);
      const maxEnd = g.entries.reduce((max, e) => Math.max(max, e.year), -Infinity);
      return {
        id: `tl-edu-${g.organization_id ?? g.institution}`,
        label: g.institution,
        years: minStart !== maxEnd ? `${minStart} – ${maxEnd}` : `${maxEnd}`,
      };
    }),
  ];
  const activeIds = useVisibleSections(timelineItems.map((t) => t.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeometricBackground />
      <TimelineSidebar items={timelineItems} activeIds={activeIds} />

      <main className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">

        {/* ── Highlighted org logos ── */}
        {highlightedOrgs.length > 0 && (
          <div className="mb-14 fade-in-section">
            <div className="flex flex-wrap items-center gap-10">
              {highlightedOrgs.filter((org) => org.logo).map((org) => (
                <img
                  key={org.id}
                  src={org.logo!}
                  alt={org.name}
                  title={org.name}
                  className="h-8 object-contain opacity-50 hover:opacity-80 transition-opacity duration-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <header className="mb-10 fade-in-section" style={{ animationDelay: "0.06s" }}>
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-2">
                {generalInfo?.name}
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
                <ExperienceGroupCard key={i} id={`tl-exp-${group.organization?.id ?? "none"}`} group={group} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        {educationGroups.length > 0 && (
          <Section title="Education" delay="0.28s">
            <div className="space-y-10">
              {educationGroups.map((group) => (
                <EducationGroupBlock
                  key={group.organization_id ?? group.institution}
                  id={`tl-edu-${group.organization_id ?? group.institution}`}
                  group={group}
                />
              ))}
            </div>
          </Section>
        )}


        {/* ── Footer ── */}
        <footer className="mt-20 pt-8 border-t border-border flex justify-center fade-in-section">
          <img
            src={`${import.meta.env.BASE_URL}sign.png`}
            alt="Signature"
            className="h-28 opacity-40 hover:opacity-60 transition-opacity duration-500"
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

const ExperienceGroupCard = ({ id, group }: { id: string; group: ExperienceGroup }) => {
  const org = group.organization;

  return (
    <div id={id}>
      <div className="flex items-center gap-3 mb-3">
        {org?.logo && (
          <img src={org.logo} alt={org.name} className="h-5 w-5 object-contain opacity-60 dark:invert flex-shrink-0" />
        )}
        <p className="text-sm font-semibold text-foreground">{org?.name ?? "—"}</p>
      </div>
      <div className="space-y-4 border-l border-border/50 pl-4">
        {group.roles.map((role) => {
          const [rStart, rEnd] = role.period.split("–").map((s) => s.trim());
          return (
            <Link key={role.id} to={`/experience/${role.id}`} className="group block">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <p className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                  {role.role}
                </p>
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider flex-shrink-0">
                  {rStart} — {rEnd}
                </span>
              </div>
              {role.short && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.short}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const EducationGroupBlock = ({ id, group }: { id: string; group: EducationGroup }) => (
  <div id={id}>
    <div className="flex items-center gap-3 mb-3">
      {group.logo && (
        <img src={group.logo} alt={group.institution} className="h-5 w-5 object-contain opacity-60 dark:invert flex-shrink-0" />
      )}
      <p className="text-sm font-semibold text-foreground">{group.institution}</p>
    </div>
    <div className="space-y-4 border-l border-border/50 pl-4">
      {group.entries.map((edu) => (
        <Link key={edu.id} to={`/education/${edu.id}`} className="group block">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <p className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
              {edu.degree}
              {edu.specialization && (
                <span className="font-normal text-muted-foreground"> · {edu.specialization}</span>
              )}
            </p>
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider flex-shrink-0">
              {edu.start_year ? `${edu.start_year} – ${edu.year}` : edu.year}
            </span>
          </div>
          {edu.short && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{edu.short}</p>
          )}
        </Link>
      ))}
    </div>
  </div>
);

const TimelineSidebar = ({
  items,
  activeIds,
}: {
  items: { id: string; label: string; years: string }[];
  activeIds: Set<string>;
}) => (
  <nav className="fixed left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col z-20">
    <div className="relative flex flex-col">
      <div className="absolute left-[calc(5rem+3px)] top-3 bottom-3 w-px bg-border/50" />
      {items.map((item) => {
        const active = activeIds.has(item.id);
        return (
          <button
            key={item.id}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex items-center gap-3 py-1.5 group text-left"
          >
            <span className={`text-[10px] transition-all duration-300 whitespace-nowrap w-20 text-right flex-shrink-0 ${
              active ? "text-muted-foreground font-medium" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"
            }`}>
              {item.years}
            </span>
            <div className={`relative z-10 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
              active ? "bg-primary scale-150" : "bg-border group-hover:bg-muted-foreground"
            }`} />
            <span className={`text-[10px] transition-all duration-300 whitespace-nowrap ${
              active ? "text-foreground font-semibold" : "text-muted-foreground/40 group-hover:text-muted-foreground"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);


export default CV;
