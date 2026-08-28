<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- List of modified principles:
  - Updated Principle I: Fidelidad a la Investigación (Research-Backed Features Only)
  - Updated Principle II: Alcance de MVP Estricto (Strict MVP Scope & Phase 2 Deferral)
  - Updated Principle III: Trazabilidad de Decisiones (Explicit Decision & Risk Documentation)
  - Updated Principle IV: Simplicidad sobre Abstracción Prematura (Open SaaS / Wasp First)
  - Updated Principle V: Seguridad de Datos Sensibles y Control de Acceso por Rol (RBAC Data Protection)
- Added sections: Core Principles, Technical Context & Stack Guidance, Code & Documentation Conventions, Governance
- Templates requiring updates:
  - ✅ `.specify/templates/plan-template.md` (Constitution Check alignment verified)
  - ✅ `.specify/templates/spec-template.md` (Verified alignment with strict MVP scope & research traceability)
  - ✅ `.specify/templates/tasks-template.md` (Task breakdown rules align with Open SaaS conventions and RBAC security)
- Follow-up TODOs: None
-->

# PetPocket Constitution

## Core Principles

### I. Fidelidad a la Investigación (Research-Backed Features Only)
No feature or capability MUST be implemented unless it is directly supported by user interviews and documented evidence in `spec.md`. Requirements MUST NOT be invented or introduced speculatively. Any proposed feature must trace directly back to verified user scenarios.

### II. Alcance de MVP Estricto (Strict MVP Scope & Phase 2 Deferral)
The MVP scope is strictly limited to four core capabilities:
1. **Appointment Scheduling** (Agendamiento de citas con prevención de colisiones).
2. **Automated Reminders** (Recordatorios automáticos de vacunas y controles).
3. **Digital Medical History** (Historial médico digital centralizado y portable).
4. **Location-Based Veterinary Search** (Búsqueda de veterinarias por cercanía).

Features outside this scope—specifically product catalogs/store e-commerce (FR-009) and advanced search filters (by service type or rating)—MUST remain deferred to Phase 2 as documented in `spec.md`.

### III. Trazabilidad de Decisiones (Explicit Decision & Risk Documentation)
All scope adjustments, architectural trade-offs, or unverified mentor assumptions MUST be explicitly documented as transparent decisions/known risks within `spec.md` or `plan.md`. Unverified assumptions MUST NOT be silently made or hidden in implementation details.

### IV. Simplicidad sobre Abstracción Prematura (Open SaaS Foundation First)
Engineers MUST prioritize simple, direct implementations relying on built-in Open SaaS (`wasp-lang/open-saas`) patterns and capabilities. Introducing new external dependencies, custom abstractions, or modifying the base project structure MUST NOT be allowed when built-in Open SaaS mechanisms suffice.

### V. Seguridad de Datos Sensibles y RBAC (Sensitive Data Protection & Role Access Control)
Pet medical histories and personal user data MUST be protected using built-in Open SaaS authentication. Strict Role-Based Access Control (RBAC) MUST be enforced across all API endpoints and pages for the three system roles:
- **Pet Owner** (`dueño de mascota`)
- **Veterinary Business** (`negocio / veterinaria`)
- **Platform Admin** (`administrador de plataforma`)

---

## Technical Context & Stack Guidance

- **Foundation Stack**: Built on Open SaaS (`github.com/wasp-lang/open-saas`) utilizing the Wasp-lang framework.
- **Built-in Services**: Standard Open SaaS authentication, user management, routing, and administration features MUST be reused without altering base architecture.
- **Monetization Deferral**: Payment integration (Stripe) included in Open SaaS MUST remain unused/inactive in the MVP phase, as no monetization model is defined for MVP. The module remains present in the codebase for future expansion.

---

## Code & Documentation Conventions

- **Directory Structure**: The existing Open SaaS directory structure MUST be preserved without re-structuring the base project.
- **Code & Entity Naming**: Entities, models, functions, variables, and code identifiers MUST be written in **English** (following Wasp / Open SaaS standards).
- **Business Documentation**: Product specifications, user scenarios, business logic documentation, and user-facing copy MUST be written in **Spanish**.
- **Version Control & Commits**: Git commit messages MUST be short, descriptive, and consistent (written in Spanish or English).

---

## Governance

This Constitution supersedes all informal development practices.
- **Amendments**: Proposed changes to principles or guidelines require documented Pull Requests, team consensus, and an updated Sync Impact Report.
- **Versioning Policy**:
  - **MAJOR**: Incompatible governance policy shifts or core principle removals.
  - **MINOR**: Addition or material expansion of principles, technical guidance, or workflow rules (e.g., v1.0.0 → v1.1.0).
  - **PATCH**: Typos, wording clarifications, or minor formatting updates.
- **Compliance Enforcement**: Every feature specification, implementation plan, and PR MUST explicitly pass a Constitution Compliance check prior to implementation.

**Version**: 1.1.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-01
