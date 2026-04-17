---
name: maintain-agents-md
description: "Update AGENTS.md when skills are added, removed, or modified. Use when: creating a new skill, deleting a skill, renaming a skill, updating a skill description, syncing AGENTS.md with current skills."
argument-hint: "Describe what changed (skill added/removed/updated)"
---

# Maintain AGENTS.md

Keep the root `AGENTS.md` file in sync with the skills defined in `.agent/skills/`.

## When to Use

- After creating a new skill in `.agent/skills/<name>/SKILL.md`
- After removing a skill directory from `.agent/skills/`
- After renaming a skill or changing its description
- When asked to audit or sync `AGENTS.md`

## Procedure

1. **Scan** — List all directories under `.agent/skills/` to discover current skills.
2. **Read** — For each skill, read its `SKILL.md` and extract the `name` and `description` from the YAML frontmatter.
3. **Read AGENTS.md** — Read the current `AGENTS.md` at the repository root.
4. **Diff** — Compare the skills found on disk with the entries in `AGENTS.md`.
5. **Update** — Add, remove, or edit entries in `AGENTS.md` to match the skills on disk.

## AGENTS.md Format

`AGENTS.md` uses a single table under a `# Skills` heading:

```markdown
# Skills

| Skill | Path | Description |
|-------|------|-------------|
| <name> | `.agent/skills/<name>/SKILL.md` | <Short one-line description.> |
```

### Rules

- Use the skill's `name` from frontmatter as the Skill column value.
- The description should be one concise sentence derived from the skill's `description` field.
- List skills in alphabetical order by name.
- Do not add entries for skills that no longer exist on disk.
- Do not remove the `# Skills` heading even if no skills exist.
