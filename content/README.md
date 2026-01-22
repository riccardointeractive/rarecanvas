# Content Directory

**This directory contains markdown content for the blog.**

---

## 📁 Structure

```
content/
├── blog/           ← Blog posts (markdown with frontmatter)
└── README.md       ← This file
```

---

## 📝 Blog Posts

**Location:** `content/blog/`  
**Format:** Markdown with YAML frontmatter  
**Used by:** `/blog` and `/blog/[slug]` pages

**Example:**
```markdown
---
title: "Building a DEX on Klever"
excerpt: "Learn how we built Digiko's decentralized exchange..."
date: "2025-12-01"
readTime: "8 min read"
category: "development"
featured: true
---

Your blog content here...
```

---

## ⚠️ Deprecated Folders (Removed)

The following were migrated to TypeScript configs:

| Old Location | New Location |
|--------------|--------------|
| `content/updates/` | `src/app/updates/config/updates.config.ts` |
| `content/roadmap/` | No longer used |

---

## ✏️ Editing Blog Posts

Edit markdown files directly:

```bash
# Edit a blog post
vi content/blog/building-dex-on-klever.md

# Commit changes
git add content/
git commit -m "docs: update blog post"
git push
```

---

**Last Updated:** January 16, 2026
