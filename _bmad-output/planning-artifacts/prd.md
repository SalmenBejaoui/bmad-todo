---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
workflowStatus: complete
completedAt: '2026-02-21'
inputDocuments:
  - product-brief-bmad-todo-2026-02-21.md
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document - bmad-todo

**Author:** Salmen
**Date:** 2026-02-21

---

## Executive Summary

bmad-todo is a full-stack, single-user task management web application built to deliver a
clean, fast, and frictionless personal productivity experience. The product targets any
individual user who needs to reliably track personal tasks without the overhead, onboarding,
or feature complexity that characterises mainstream Todo tools. Users can open the application
and immediately create, view, complete, and delete tasks — no account, no configuration, no
guidance required. All data persists reliably across sessions. The frontend is responsive and
accessible across desktop and mobile devices, with explicit empty, loading, and error states
ensuring a polished experience under all conditions.

The application is engineered for production from day one: a well-structured, tested codebase
with structured operational logging, minimum 70% meaningful code coverage, and a Playwright
E2E test suite covering the complete core user journey. The architecture is intentionally
extensible — single-user and authentication-free in v1, but designed so that multi-user
support, authentication, and richer task metadata can be introduced without structural rewrites.

### What Makes This Special

Most Todo tools fail individual users not because they lack features, but because they have
too many. bmad-todo takes the opposite stance: every feature excluded is a deliberate
decision, not an omission. The result is a product where the entire user interface serves one
purpose — the core task loop (add → view → complete → delete) — executed with zero friction.
The differentiator is philosophical: radical simplicity as a first-class product value,
combined with production-grade technical quality that makes the application trustworthy,
deployable, and extensible without compromise.

### Project Classification

| Attribute       | Value                            |
|-----------------|----------------------------------|
| Project Type    | Web Application (SPA + REST API) |
| Domain          | General productivity             |
| Complexity      | Low                              |
| Project Context | Greenfield                       |

---

## Success Criteria

### User Success

- A first-time user completes the full core task-management loop (add, view, complete, delete)
  without guidance, instructions, or support
- The application presents no onboarding, no modals, and no configuration on first visit —
  the task list is immediately actionable
- Completed tasks are visually distinguishable from active tasks at a glance
- The application behaves consistently and predictably across sessions — tasks are always
  present and unchanged after a page refresh or return visit
- Zero critical WCAG accessibility violations — core interactions are keyboard-accessible
  and screen-reader compatible

### Business Success

- The application runs stably in a production environment without manual intervention
- All critical operations (task creation, completion, deletion, errors) produce structured
  log output sufficient to diagnose failures and verify system health without code inspection
- A developer or DevOps engineer can deploy, understand, and extend the codebase without
  reverse-engineering decisions

### Technical Success

- Minimum **70% meaningful code coverage** (unit + integration) — tests verify behaviour,
  not just line execution
- Minimum **5 passing Playwright E2E tests** covering the complete core user journey
- Zero critical WCAG violations in automated accessibility audit
- Core API endpoints respond in under **200ms** under typical load
- All critical operations emit structured log entries

### Measurable Outcomes

| Outcome | Target |
|---|---|
| Core user journey completable without guidance | 100% of actions |
| Code coverage (meaningful) | ≥ 70% |
| Playwright E2E tests passing | ≥ 5 |
| Critical WCAG violations | 0 |
| API response time (typical load) | < 200ms |
| Data persistence across sessions | 100% |

---

## User Journeys

### Journey 1 — The Everyday Organizer: First Visit (Success Path)

**Persona:** Alex, a freelance designer juggling multiple client projects. Alex has tried
Todoist and Notion but finds them overwhelming — the first thing they see is always a
feature, not a task field. Alex just wants to write down what to do next.

**Opening Scene:** It's Monday morning. Alex opens a new browser tab and navigates to the
app. There is no splash screen, no "get started" button, no login prompt. The page loads
immediately: an input field at the top, an empty list below with a quiet message — "No
tasks yet. Add one above."

**Rising Action:** Alex types "Call client about invoice" and hits Enter. The task appears
instantly in the list. No spinner, no confirmation dialog — it's just there. Alex adds
two more tasks. Before leaving the desk, Alex marks the first task complete. It shifts
visually — a strikethrough, dimmed — clearly done, but still visible.

**Climax:** Later in the day, Alex closes the laptop. That evening, on a phone, Alex opens
the app again. All three tasks are there. The completed one is still marked done.

**Resolution:** Alex has a reliable, frictionless capture tool. No account, no setup, no
notifications asking for a rating. Just tasks, exactly where they were left.

*Capabilities revealed: create task, view list, toggle completion, delete task, persistent
storage, responsive UI, empty state, session continuity.*

---

### Journey 2 — The Everyday Organizer: Error Recovery (Edge Case Path)

**Persona:** Same Alex, same morning. But this time the network drops mid-interaction.

**Opening Scene:** Alex tries to add a new task. The request fails. Instead of a broken
page or a silent hang, a clear error message appears: "Couldn't save your task. Check your
connection and try again." The input is preserved — Alex doesn't have to retype.

**Rising Action:** Alex retries. This time it works. The task appears. Elsewhere, Alex
tries to delete a task that's already been deleted in another tab. The app handles the
conflict gracefully — the task disappears from the list, no crash, no confusing error.

**Resolution:** Alex never feels the application is fragile. When things go wrong, the
feedback is clear and recovery is obvious.

*Capabilities revealed: error states, input preservation on failure, graceful conflict
handling, meaningful error messages.*

---

### Journey 3 — The Developer / DevOps Maintainer: Deployment Day

**Persona:** Rania, a backend developer on a small team. She's responsible for deploying
and maintaining the application. She didn't build it and is reading the codebase for the
first time.

**Opening Scene:** Rania opens the project repository. The README is the first thing she
reads. It explains the architecture clearly: what the frontend does, what the API does,
how they connect, and how to run the application. No ambiguity, no undocumented magic.

**Rising Action:** Rania follows the deployment steps. The application starts without
errors. She runs the test suite: all tests pass. She checks the coverage report: above
70%. She runs the Playwright tests: all 5 passing. Rania deploys to the production
environment. The app loads, she creates a test task, it persists, she deletes it.

**Climax:** A week later, an error is reported. Rania opens the logs. The structured log
output clearly shows which operation failed, when, and with what context. She diagnoses
the issue in minutes without needing to reproduce it locally.

**Resolution:** Rania trusts the codebase. It does what it says, it's tested, and when
something goes wrong, she has the information she needs to fix it.

*Capabilities revealed: structured logging, test suite (unit + E2E), deployment
documentation, readable architecture, observable operations.*

---

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---|---|
| Everyday Organizer — Success | Create, view, complete, delete task; persistent storage; responsive UI; empty state |
| Everyday Organizer — Edge Case | Error states; input preservation; graceful failure handling |
| Developer / Maintainer | Structured logging; test suite (unit + E2E); deployment docs; clean architecture |

---

## Web Application Specific Requirements

### Project-Type Overview

SPA with REST API backend. All interactions occur client-side with no full-page reloads.
The frontend communicates asynchronously with the API; UI updates optimistically on user
action. No public-facing landing pages, SSR, or multi-page routing.

### Technical Architecture Considerations

**SPA Architecture**
- Single HTML entry point; all routing and rendering managed client-side
- Frontend communicates exclusively with the REST API backend
- No server-side rendering (SSR) required — the application is not publicly indexed

**Browser Support**
- Modern evergreen browsers only: Chrome, Firefox, Safari, Edge (latest stable versions)
- No legacy browser support (no IE11, no polyfill overhead)
- CSS and JS features available in all modern evergreen browsers are permitted without fallbacks

**SEO**
- Not applicable — the application has no publicly indexable content
- Semantic HTML must be used throughout for accessibility purposes, not for SEO

**Real-Time Behaviour**
- Optimistic UI updates: the UI reflects changes immediately on user action
- Server confirmation happens asynchronously in the background
- On server error, the UI rolls back the optimistic update and displays an error message
- No live cross-tab or cross-device sync required (no WebSockets)

**Accessibility**
- Semantic HTML elements used throughout (`<button>`, `<input>`, `<ul>`, `<li>`, etc.)
- All interactive elements must be keyboard-accessible
- ARIA attributes used where semantic HTML alone is insufficient
- Zero critical WCAG violations in automated audit

### Implementation Considerations

- The API must return meaningful HTTP status codes and error bodies for all failure cases
- The frontend must handle all error states gracefully (network failure, server error, not found)
- Input must be preserved on submission failure so the user does not need to retype
- Loading states must be shown where the UI depends on an in-flight API response
- Empty state must be explicitly designed and implemented (not a blank page)

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience + Platform MVP — the two philosophies are combined deliberately.
Every feature that ships is complete and production-grade (experience), while the architecture
is built for extensibility from the start (platform). The scope is intentionally narrow so
that both goals are achievable simultaneously without compromise.

**Scope discipline:** The MVP feature set is fixed and minimal. Any feature not listed under
MVP is explicitly deferred — not forgotten. Additions to MVP scope require explicit
re-evaluation of quality, testing, and architectural impact.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Everyday Organizer — success path (full task-management loop)
- Everyday Organizer — error recovery (graceful failure handling)
- Developer / DevOps Maintainer — deployment and operations

**Must-Have Capabilities:**
- Create a todo (via modal or off-canvas panel: required title, optional short description)
- View all todos (single list, active and completed visually distinguished)
- Complete a todo (toggle, immediate optimistic UI update)
- Delete a todo (permanent removal)
- Persistent storage across sessions
- Responsive layout (desktop and mobile, evergreen browsers)
- Empty state, loading state, error state
- Structured logging for all critical operations
- Accessibility: zero critical WCAG violations, keyboard-navigable, semantic HTML
- Test suite: ≥ 70% meaningful coverage, ≥ 5 Playwright E2E tests

### Post-MVP Features

**Phase 2 — Growth:**
- User authentication and personal accounts
- Edit existing todo text
- Task ordering / prioritisation
- Due dates and deadlines
- Search, filtering, and sorting

**Phase 3 — Expansion:**
- Multi-user support and collaboration
- Notifications and reminders
- Tags, labels, and categories
- Mobile native applications

### Risk Mitigation Strategy

**Technical & Architectural Risks:** To be assessed during the architecture phase.
The architect will evaluate stack choices, extensibility trade-offs, and any technical
risks introduced by the current scope definition.

**Scope creep risk:** The primary product risk is gold-plating — adding complexity
to a problem that rewards simplicity. The explicit out-of-scope list in the MVP definition
is the primary mitigation: any addition must be justified against the core product value.

---

## Functional Requirements

> **This is the capability contract.** UX designers will design only what is listed here.
> The architect will support only what is listed here. Epics and stories will implement
> only what is listed here. Any capability absent from this list does not exist in the product.

### Task Management

- **FR1:** A user can create a new todo item by providing a required title and an optional short
  description, submitted via a modal or off-canvas panel
- **FR2:** A user can view the complete list of all their todo items
- **FR3:** A user can mark a todo item as complete
- **FR4:** A user can mark a completed todo item as incomplete (toggle back)
- **FR5:** A user can delete a todo item permanently
- **FR6:** The system stores each todo item with the following fields:
  - **Title** (required): a short text label for the task
  - **Description** (optional): a short free-text elaboration on the task
  - **Completion status**: active or completed
  - **Creation timestamp**: set once when the item is first created; never modified
  - **Done timestamp**: set when the item is first marked complete; cleared if toggled back to active
  - **Last-modified timestamp**: updated on every mutation (status change, description update)
  - **Deletion timestamp**: recorded when the item is deleted (for audit/observability purposes)
- **FR6a:** Task creation occurs in a modal or off-canvas panel that presents a title field
  (required) and a description field (optional) before submission
- **FR6b:** The task list displays only the task title for each item; full task details
  (description and timestamps) are accessible by opening the individual task
- **FR6c:** A user can open a task item to view all its details: title, description,
  creation timestamp, done timestamp (if completed), and last-modified timestamp

### List Display & Visual State

- **FR7:** Active and completed todo items are visually distinguishable from each other at a glance
- **FR8:** The list displays an empty state when no todo items exist
- **FR9:** The list displays a loading state while data is being fetched
- **FR10:** The application displays an error state when data cannot be loaded
- **FR11:** All todo items are visible immediately when the application loads

### Optimistic Interaction

- **FR12:** Todo item creation is reflected in the UI immediately upon submission, before server confirmation
- **FR13:** Todo completion toggle is reflected in the UI immediately upon interaction, before server confirmation
- **FR14:** Todo deletion is reflected in the UI immediately upon interaction, before server confirmation
- **FR15:** The UI reverts an optimistic update and displays a meaningful error message if the server operation fails
- **FR16:** The user's input is preserved when a submission fails, so no retyping is required

### Data Persistence

- **FR17:** All todo items persist across page refreshes
- **FR18:** All todo items persist across browser sessions
- **FR19:** The system stores data durably on the server side (not client-side storage only)

### Accessibility & Responsive Design

- **FR20:** All interactive elements are operable via keyboard without a mouse
- **FR21:** The application uses semantic HTML elements for all structural and interactive components
- **FR22:** The application renders correctly and is fully usable on mobile screen sizes
- **FR23:** The application renders correctly and is fully usable on desktop screen sizes
- **FR24:** ARIA attributes are applied where semantic HTML alone is insufficient to convey context

### API Contract

- **FR25:** The system exposes an endpoint to retrieve all todo items
- **FR25a:** The system exposes an endpoint to retrieve a single todo item by ID (for the
  task detail view)
- **FR26:** The system exposes an endpoint to create a new todo item, accepting a required
  title and an optional description
- **FR27:** The system exposes an endpoint to update a todo item's completion status;
  the server sets the done timestamp and last-modified timestamp accordingly
- **FR28:** The system exposes an endpoint to delete a todo item; the server records
  a deletion timestamp before removing or soft-deleting the record
- **FR29:** All API endpoints return meaningful HTTP status codes for both success and failure responses
- **FR30:** All API error responses include a descriptive message body

### Observability

- **FR31:** The system emits a structured log entry when a todo item is created
- **FR32:** The system emits a structured log entry when a todo item's completion status is updated
- **FR33:** The system emits a structured log entry when a todo item is deleted
- **FR34:** The system emits a structured log entry when a server-side error occurs, including context
  sufficient to diagnose the failure without code inspection

### Quality Assurance

- **FR35:** The system has automated unit and integration tests covering ≥ 70% of meaningful code paths
- **FR36:** The system has automated E2E tests implemented in Playwright covering the complete core
  user journey (create, view, complete, delete)
- **FR37:** A minimum of 5 Playwright E2E tests pass as part of the automated test suite
- **FR38:** Tests are integrated into the development workflow and must pass before any change
  is considered complete
- **FR39:** The application produces zero critical WCAG violations in an automated accessibility audit

---

## Non-Functional Requirements

### Performance

- **NFR1:** Core API endpoints (list, create, update, delete) respond in under **200ms**
  under typical single-user load
- **NFR2:** The frontend reflects user actions (create, complete, delete) immediately via
  optimistic updates — no visible delay between user action and UI change
- **NFR3:** The initial page load renders the task list within **2 seconds** on a standard
  broadband connection

### Reliability

- **NFR4:** The application does not lose or corrupt todo data under normal operating conditions
- **NFR5:** The application handles API failures gracefully without crashing or entering an
  unrecoverable state
- **NFR6:** The application recovers to a consistent state after a failed optimistic update

### Accessibility

- **NFR7:** The application produces **zero critical WCAG 2.1 violations** as measured by
  an automated accessibility audit tool
- **NFR8:** All core user interactions (create, complete, delete todo) are fully operable
  using keyboard only
- **NFR9:** The application uses semantic HTML such that screen readers can navigate and
  understand the UI without additional configuration

### Maintainability

- **NFR10:** The codebase achieves **≥ 70% meaningful code coverage** across unit and
  integration tests
- **NFR11:** The test suite can be run with a single command and produces a clear pass/fail
  result
- **NFR12:** The application can be deployed by following the README without requiring
  knowledge of undocumented conventions or decisions
- **NFR13:** The architecture does not structurally prevent the addition of user
  authentication or multi-user support in future iterations
- **NFR14:** Structured log output includes sufficient context (operation type, entity ID,
  timestamp, error details where applicable) to diagnose failures without code inspection

### Security (Baseline)

- **NFR15:** The API does not expose internal error details (stack traces, paths, internal
  identifiers) in error responses to the client
- **NFR16:** The application protects against common web vulnerabilities applicable to a
  public-facing application (XSS, injection) using standard framework-level protections
