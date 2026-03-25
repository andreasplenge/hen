

## Use YAML Filename as Project Slug

### What changes
Instead of storing a `slug` field in each project YAML file, derive the slug automatically from the YAML filename (e.g., `control-algorithm.yaml` becomes `control-algorithm`).

### Steps

1. **Remove `slug` from all project YAML files** (11 files in `data/projects/`)
   - Delete the `slug: ...` line from each file

2. **Update `src/lib/cv-loader.ts`**
   - Change `extractYamlData` for projects to a new function that also captures the filename from the module key (e.g., `/data/projects/control-algorithm.yaml` -> `control-algorithm`)
   - Remove `slug` from the `YAMLProject` interface
   - In `processProjects()`, iterate over `Object.entries(projectModules)` instead of using `extractYamlData`, extract the filename stem from the key, and set `slug` to that filename (without `.yaml`)

3. **No changes needed to**:
   - `CVSelectedWork` interface (still has `slug` field, now auto-derived)
   - `useCVSelectedWorkBySlug` hook (unchanged)
   - `ProjectDetail.tsx`, `CV.tsx`, `ExperienceDetail.tsx`, `EducationDetail.tsx` (all use `slug` the same way)
   - `App.tsx` routing (unchanged)

### Technical details

**`src/lib/cv-loader.ts` -- `processProjects()` rewrite:**

```typescript
function processProjects(): CVSelectedWork[] {
  const results: CVSelectedWork[] = [];

  Object.entries(projectModules).forEach(([key, m]) => {
    const mod = m as { default: YAMLProject[] };
    const items = mod.default || [];
    // Extract filename without extension: "/data/projects/control-algorithm.yaml" -> "control-algorithm"
    const filename = key.split('/').pop()?.replace('.yaml', '') || '';

    items.forEach((proj, idx) => {
      results.push({
        id: `proj-${proj.id}`,
        title: proj.header,
        description: proj.description,
        link: proj.link,
        color: proj.color,
        slug: filename,
        tags: [...(proj.programming || []), ...(proj.tools || []), ...(proj.skills || [])],
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
      });
    });
  });

  return results;
}
```

**`YAMLProject` interface** -- remove the `slug` field.

**All 11 YAML files** -- remove the `slug:` line from each.
