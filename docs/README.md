# Digiko Documentation

**Welcome!** This is your guide to understanding and working with Digiko's design and codebase.

---

## 🗺️ NAVIGATION BY NEED

### 🎨 "Why did we make this design choice?"

**→ Read:** [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md)

**Covers:**
- Design territories (Fintech vs Vegas)
- Core principles (Mobile-first, Glass morphism, Minimalism)
- Anti-patterns (what NOT to do)
- Best practices
- Decision-making frameworks

**Who needs this:** Product designers, stakeholders, anyone making design decisions

---

### 🔨 "How do I build this component?"

**→ Visit:** [Design System](/designsystem)

**Covers:**
- Live component previews (interactive)
- Copy-paste code snippets
- Color palettes (click to copy)
- Typography scales (visual examples)
- Component API reference
- Real components from /src/components/ui

**Who needs this:** Frontend developers building features

---

### 📱 "How do I implement responsive design?"

**→ Read:** [guides/RESPONSIVE_GUIDE.md](guides/RESPONSIVE_GUIDE.md)

**Covers:**
- Mobile-first implementation steps
- Breakpoint strategies
- Typography scaling patterns
- Spacing systems
- Testing checklist
- Migration guide

**Who needs this:** Developers implementing complex responsive features

---

### 🔧 "How do I set up the project?"

**→ Read:** [dev/README.md](dev/README.md)

**Covers:**
- Installation and setup
- Development workflow
- Testing guide
- Deployment process
- Troubleshooting

**Who needs this:** New developers joining the project

---

## 📚 DOCUMENTATION STRUCTURE

### 3-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: WHY? (Philosophy)                                  │
│ → DESIGN_PHILOSOPHY.md                                      │
│                                                             │
│ Content: Design territories, principles, decision frameworks│
│ Users: Product designers, stakeholders                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: HOW? (Component Library)                           │
│ → /designsystem (Interactive web pages)                     │
│                                                             │
│ Content: Live components, code snippets, visual examples    │
│ Users: Frontend developers building features                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ TIER 3: IMPLEMENT? (Technical Guides)                      │
│ → guides/ (Feature-specific markdown docs)                  │
│                                                             │
│ Content: Step-by-step implementation guides                 │
│ Users: Developers implementing complex features             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 FILES IN THIS DIRECTORY

### Core Documentation

| File | Purpose | Size | Who Needs It |
|------|---------|------|--------------|
| **DESIGN_PHILOSOPHY.md** | Why we design this way | ~15KB | Designers, PMs |
| **CHANGELOG.md** | Project changelog | 4KB | Everyone |
| **TINACMS_SETUP.md** | TinaCMS configuration | 9KB | Content managers |

### Feature Guides (/guides/)

| File | Purpose | Size | Who Needs It |
|------|---------|------|--------------|
| **RESPONSIVE_GUIDE.md** | Responsive implementation | ~20KB | Frontend devs |
| **SWAP_README.md** | Swap feature overview | 6KB | Backend/Frontend |

### Developer Documentation (/dev/)

| File | Purpose | Who Needs It |
|------|---------|--------------|
| **README.md** | Developer overview | All developers |
| **INSTALLATION.md** | Setup instructions | New developers |
| **TESTING_GUIDE.md** | Testing practices | QA, developers |
| **TROUBLESHOOTING.md** | Common issues | Everyone |
| **CONTRACT_DEVELOPMENT.md** | Smart contract docs | Blockchain devs |
| **LESSONS_*.md** | Daily learnings | Team retrospectives |

### Archived (/archive/)

Old documentation that has been superseded but kept for historical reference.

| File | Status | Replaced By |
|------|--------|-------------|
| **design_guide_v1.9_archived.md** | Archived Dec 1, 2025 | DESIGN_PHILOSOPHY.md + Design System |

---

## 🎯 QUICK START GUIDES

### I'm a new designer

1. Read [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md) (15 min)
2. Browse [Design System](/designsystem) (10 min)
3. Review a few pages in the app to see principles applied

### I'm a new frontend developer

1. Read [dev/INSTALLATION.md](dev/INSTALLATION.md) - Set up project
2. Browse [Design System](/designsystem) - See available components
3. Check [guides/RESPONSIVE_GUIDE.md](guides/RESPONSIVE_GUIDE.md) - Learn responsive patterns
4. Start building!

### I'm working on a specific feature

1. Check if there's a guide in `/guides/` for your feature
2. Use [Design System](/designsystem) for components
3. Refer to [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md) for design decisions
4. Add to [CHANGELOG.md](CHANGELOG.md) when done

---

## 🔗 EXTERNAL LINKS

- **Live Site:** [digiko.io](https://digiko.io)
- **Design System:** [digiko.io/designsystem](https://digiko.io/designsystem)
- **Klever Blockchain:** [klever.io](https://klever.io)
- **Project Roadmap:** [digiko.io/roadmap](https://digiko.io/roadmap)

---

## 📝 DOCUMENTATION PRINCIPLES

### Keep It DRY (Don't Repeat Yourself)

- **Single Source of Truth:** Design System is the source of truth for components
- **Link, Don't Duplicate:** Reference other docs instead of copying content
- **Update Once:** Changes to components happen in code, docs update automatically

### Keep It Current

- **Date Everything:** All docs show last updated date
- **Archive Old Versions:** Don't delete, archive with clear status
- **Review Quarterly:** Ensure docs match current implementation

### Keep It Scannable

- **Clear Headings:** Use descriptive section titles
- **Visual Hierarchy:** Use formatting to guide eye
- **Quick Reference:** Provide TL;DR sections where helpful

---

## 🚀 CONTRIBUTING TO DOCS

### When to Update Docs

**Update DESIGN_PHILOSOPHY.md when:**
- Adding a new design territory
- Establishing a new core principle
- Discovering a new anti-pattern
- Creating a decision framework

**Update Design System when:**
- Creating a new component
- Modifying component API
- Adding new variants
- Changing component behavior

**Update guides/ when:**
- Implementing a new complex feature
- Discovering better implementation patterns
- Creating migration guides
- Documenting technical decisions

**Update dev/ docs when:**
- Changing development workflow
- Adding new tools
- Discovering solutions to common issues
- Updating dependencies

### Documentation Standards

1. **Use clear, simple language**
2. **Provide code examples**
3. **Include "why" not just "how"**
4. **Add last updated date**
5. **Test examples before documenting**

---

## 📊 DOCUMENTATION METRICS

**Before Refactor (Nov 30, 2025):**
- Total design docs: ~170KB
- Redundancy: ~60%
- Files: 7+ scattered files

**After Refactor (Dec 1, 2025):**
- Total design docs: ~43KB
- Redundancy: ~5%
- Files: 3 organized tiers

**Improvement:** 75% reduction in size, 95% reduction in redundancy 🎉

---

## ❓ FREQUENTLY ASKED QUESTIONS

**Q: Which doc should I read first?**
A: Depends on your role:
- Designer → DESIGN_PHILOSOPHY.md
- Developer → dev/README.md
- Both → Design System (/designsystem)

**Q: The Design System shows one thing, but old code does another. Which is right?**
A: Design System is always the current standard. Update old code to match.

**Q: Should I update design_guide.md?**
A: No, it's archived. Update DESIGN_PHILOSOPHY.md or Design System instead.

**Q: Where do I document a new component?**
A: Create it in `/src/components/`, add to Design System, document API.

**Q: How do I know if a doc is outdated?**
A: Check "Last Updated" date. If >3 months old, verify accuracy.

---

## 📞 NEED HELP?

**Documentation Questions:**
- Check this README first
- Review related docs
- Ask in team chat

**Technical Issues:**
- Check [dev/TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md)
- Review [dev/README.md](dev/README.md)
- Check error logs

**Design Questions:**
- Read [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md)
- Browse [Design System](/designsystem)
- Review existing pages for patterns

---

**Last Updated:** December 1, 2025  
**Maintained by:** Digiko Team  
**Questions?** Open an issue or ask in team chat
