---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-02-21
author: Salmen
---

# Product Brief: bmad-todo

## Executive Summary

bmad-todo is a deliberately minimal full-stack Todo application designed to deliver a clean,
fast, and distraction-free task management experience for individual users. Where existing tools
sacrifice simplicity for feature sprawl, bmad-todo stays focused: create a task, see it, complete
it, remove it. Nothing more. Built on a solid, well-structured technical foundation, it is
designed to be immediately usable without onboarding and straightforwardly extensible as
product needs evolve.

---

## Core Vision

### Problem Statement

Personal task management tools have become increasingly bloated. Applications that once solved
a simple problem — tracking what needs to be done — now require configuration, onboarding,
account setup, and navigation through features most users never need. A user who simply wants
to write down what they need to do and mark it done is underserved by the current market.

### Problem Impact

The friction introduced by overly complex tools leads users to abandon them in favor of informal
alternatives (sticky notes, chat messages to oneself, plain text files) that lack persistence
and reliability across sessions. The result is a gap between the user's intent — staying
organized — and the tools available to support it.

### Why Existing Solutions Fall Short

Mainstream Todo apps optimize for power users, teams, and upsell opportunities. They introduce
concepts like projects, labels, priorities, integrations, and collaboration before a user has
completed their first task. Even lightweight alternatives often carry unnecessary complexity in
their UI, onboarding, or account requirements. The simplest experiences are either too ephemeral
(no persistence) or locked behind ecosystems.

### Proposed Solution

bmad-todo provides a single-user, full-stack task management application with a minimal,
responsive UI and a clean, well-defined API backend. Users can open the app and immediately
see their tasks, add new ones, mark them complete, and delete them — with no setup, no
onboarding, and no noise. Data persists reliably across sessions. The architecture is
intentionally clean and extensible, designed to support future features such as authentication
and multi-user support without requiring structural rewrites.

### Key Differentiators

- **Radical simplicity**: No onboarding, no configuration, no unnecessary UI — task management
  reduced to its essence
- **Production-ready from day one**: Well-tested, properly structured, and deployable — not a
  prototype or a demo
- **Instant responsiveness**: UI updates reflect immediately; no waiting, no loading spinners
  for basic interactions
- **Honest scope**: Features are deliberately excluded — not forgotten — making the architecture
  trustworthy and maintainable

---

## Target Users

### Primary Users

**The Everyday Organizer**
Anyone who needs to track personal tasks without friction — regardless of technical background.
This includes students, professionals, freelancers, and developers alike. What they share is a
preference for tools that stay out of their way. They don't want to learn a new system; they
want to open an app, write down what they need to do, and get on with it.

- **Context**: Personal task management, used throughout the day across devices
- **Motivation**: Stay on top of tasks without the overhead of complex productivity tools
- **Pain point**: Existing apps demand setup, onboarding, or ongoing configuration before
  delivering any value
- **Success**: Opens the app, types a task, and it's there — immediately, without friction
- **Usage pattern**: Both quick-capture (adding tasks on the go) and focused review
  (checking off and clearing completed items during a session)

**The "Aha" Moment**: The user opens the app for the first time and there is nothing to
configure — just an input field and their list. They type, press enter, and their task appears.
No account, no tutorial, no modal. That instant is when the value is felt.

### Secondary Users

**The Developer / DevOps Maintainer**
The technical person responsible for deploying and maintaining the application. This may be
the same developer who built it, or a DevOps engineer in a team. They interact with the product
at the infrastructure level — deployment, configuration, updates — rather than as a day-to-day
task user. For them, success means a codebase that is easy to understand, deploy, and keep
running without ongoing complexity.

- **Context**: Sets up and maintains the application in a production environment
- **Motivation**: A clean, well-documented, easy-to-deploy codebase with minimal operational
  overhead
- **Pain point**: Applications that are hard to run, poorly structured, or require deep
  knowledge of the original developer's decisions to maintain
- **Success**: Can deploy the application, understand its structure, and extend or update it
  without friction

### User Journey

**The Everyday Organizer**

1. **Discovery**: Finds or is given access to the deployed application — no sign-up required
2. **First use**: Lands directly on the task list (empty state is clear and inviting, not
   confusing)
3. **Core interaction**: Types a task description, submits — task appears instantly in the list
4. **Ongoing use**: Checks off completed tasks (visually distinguished), deletes what's no
   longer needed, returns throughout the day for quick capture and review
5. **Trust moment**: Refreshes or returns to the app after time away — all tasks are still
   there, exactly as left

**The Developer / DevOps Maintainer**

1. **Onboarding**: Reads the project README, understands the structure immediately
2. **Deployment**: Follows clear deployment steps, application runs without surprises
3. **Maintenance**: Can update, extend, or debug without needing to reverse-engineer decisions
4. **Confidence**: The test suite passes; the architecture is clean enough to hand off

---

## Success Metrics

### User Success

The primary measure of user success is the ability to complete all core task-management
actions — creating, viewing, completing, and deleting tasks — without guidance, confusion,
or error. A successful user experience means:

- **Zero onboarding required**: A first-time user can perform all core actions on first visit
  without instruction
- **Stability confidence**: The application behaves consistently and predictably across
  sessions; tasks are always where the user left them
- **Accessibility**: Zero critical WCAG violations — the application is usable by people
  with disabilities without degraded experience

### Business Objectives

As a non-commercial technical foundation project, business objectives are defined in terms
of technical quality and operational confidence:

- The application is stable enough to run in production without manual intervention
- All critical operations produce structured logs sufficient to diagnose issues and verify
  system health
- The codebase is clean, well-tested, and extensible — a developer can understand and extend
  it without reverse-engineering decisions

### Key Performance Indicators

**Quality & Testing**
- Minimum **70% meaningful code coverage** (unit + integration) — coverage that tests
  behaviour, not just lines
- Minimum **5 passing Playwright E2E tests** covering the core user journey (add, view,
  complete, delete task)
- Zero critical WCAG accessibility violations in automated audit

**Performance**
- API responses feel instantaneous under normal conditions; interactions should not require
  the user to wait (target: core API endpoints respond in under 200ms under typical load)

**Observability**
- All critical operations (task creation, update, deletion, errors) produce structured log
  entries sufficient to verify application health and diagnose failures without code inspection

---

## MVP Scope

### Core Features

The MVP delivers the complete core task-management loop — nothing more, nothing less:

- **Create a todo**: User enters a short text description and submits; task appears instantly
  in the list
- **View all todos**: All tasks are visible on load, with active and completed tasks visually
  distinguished at a glance
- **Complete a todo**: User can mark a task as done; visual state updates immediately
- **Delete a todo**: User can remove a task permanently
- **Persistent storage**: All tasks survive page refreshes and session restarts
- **Responsive UI**: Works correctly across desktop and mobile screen sizes
- **Graceful states**: Empty state (no tasks yet), loading state, and error state are all
  handled with clear, appropriate UI
- **Structured logging**: All critical operations (create, complete, delete, errors) produce
  structured log entries for operational visibility
- **Accessibility**: Zero critical WCAG violations; core interactions are keyboard-accessible
  and screen-reader compatible

### Out of Scope for MVP

The following are explicitly excluded from the initial version. Their absence is intentional,
not an oversight:

- User authentication and accounts
- Multi-user support and collaboration
- Editing an existing todo's text
- Task prioritization or ordering
- Due dates and deadlines
- Notifications and reminders
- Search, filtering, or sorting
- Tags, labels, or categories
- Any onboarding flow or in-app guidance

### MVP Success Criteria

The MVP is considered successful when:

- A first-time user can complete the full task-management loop (add, view, complete, delete)
  without any guidance or instruction
- The application runs stably in production with no data loss between sessions
- Test suite passes with minimum 70% meaningful code coverage
- Minimum 5 Playwright E2E tests cover the core user journey end-to-end
- Zero critical WCAG accessibility violations in automated audit
- All critical operations produce observable, structured log output
- Core API endpoints respond in under 200ms under typical load

### Future Vision

The architecture is designed to accommodate future growth without structural rewrites.
Capabilities explicitly not blocked by the current design include: user authentication and
multi-user support, task metadata (priorities, deadlines, tags), and richer filtering and
organisation features. These remain candidates for future iterations as product needs evolve.
