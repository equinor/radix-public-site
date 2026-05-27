---
name: radix-docs
description: "Write and review Radix platform documentation. Use when: writing docs, editing docs, reviewing docs, creating guides, updating documentation pages, fixing doc style, proofreading, documentation review."
argument-hint: "Describe what documentation to write or review"
---

# Radix Documentation Writer & Reviewer

## When to Use

- Writing new documentation pages for the Radix public site
- Editing or improving existing documentation
- Reviewing documentation for style, tone, and correctness
- Creating guides, how-tos, or reference pages

## Content Policy

Focus exclusively on Radix platform usage and configuration. Do not include Equinor-specific internal policies, rules, organizational details, or proprietary configuration. The audience is any developer using the open-source Radix platform.

## File Format

Documentation files use Docusaurus with YAML frontmatter:

```yaml
---
title: Page Title
displayed_sidebar: sidebarName
---
```

Use a single `# Heading` per file matching the frontmatter title. Organize content with `##` and `###` subheadings.

### Docusaurus Features

- **Admonitions**: `:::tip`, `:::warning`, `:::info` blocks for callouts
- **Code blocks**: Triple backticks with language identifier (yaml, json, bash)
- **Links**: Relative markdown links with `.md` extensions — `[text](../path/to/file.md)` or with anchors `[text](../path/to/file.md#section)`
- **Inline code**: Backticks for config properties, file names, CLI commands, variable names

## Tone and Voice

Write in a professional but conversational tone, as if speaking to a fellow developer. Be direct and confident without being pushy. Use American English spelling throughout (e.g., "customize" not "customise", "color" not "colour").

Use contractions naturally — it's, you're, we're, don't. Avoid overly formal or generic language. The reader should feel guided, not lectured.

## Writing Style

### Sentence Structure

Use active voice instead of passive voice. Vary sentence length and structure for a natural flow. Choose specific, concrete words over vague terms. Replace repetitive phrases with varied alternatives.

Good: "Radix rebuilds your component when you push to the branch."
Avoid: "The component is rebuilt by Radix when a push is made to the branch."

### Paragraphs Over Lists

Prefer flowing paragraphs over bullet points. Use bullet points only when listing discrete items (config options, CLI flags, steps in a procedure) and keep them parallel in structure. If a list has only two items, write it as a sentence instead.

### Lead With What Matters

Open each section with the most important information. Don't bury the key point after three sentences of context. End sections with clear next steps or a conclusion when appropriate.

### Avoid Redundancy

Don't repeat information that already appears in another section of the same page or in a linked page. Cross-reference with links instead.

## Formatting Rules

- Never bold a markdown heading (never `## **Heading**`)
- Use `<br/>` for self-closing HTML tags, not `<br>`
- Avoid colons before line breaks in bold text — use `**Title**<br/>` not `**Title**:<br/>`
- Use emojis sparingly — at most one or two per page in a heading or callout, never scattered through body text
- Use inline code for config properties (`replicas`), file names (`radixconfig.yaml`), commands (`rx create`), and environment variables (`RADIX_APP`)

## Common Fixes

When reviewing, watch for and correct these patterns:

| Instead of | Write |
|---|---|
| "This creates:" | "This leads to:" |
| "Key Benefits:" | "Benefits include:" |
| Passive voice | Active voice |
| Long bullet-point lists explaining concepts | Flowing paragraphs |
| Generic statements | Specific, actionable content |
| British spelling (organisation, colour) | American spelling (organization, color) |

## Review Checklist

When reviewing documentation, verify:

1. American English spelling is used consistently
2. No Equinor-specific internal policies or configuration details
3. Content focuses on Radix usage and `radixconfig.yaml` configuration
4. Tone is professional and conversational, not formal or bureaucratic
5. Active voice is preferred throughout
6. Headings are not bolded
7. Emojis are minimal and purposeful
8. Links use relative paths with `.md` extensions
9. Code examples use correct language identifiers
10. Sections lead with the most important information
