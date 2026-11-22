# Backend Specification & Implementation Plan

The comprehensive backend specification and implementation plan has been generated and saved directly to the backend project:

📄 **[brewloop-server/BACKEND-SPEC-AND-PLAN.md](file:///Users/apple/IdeaProjects/brewloop-server/BACKEND-SPEC-AND-PLAN.md)**

### Key Highlights Included in the Document:
1. **Architecture & Tech Stack**: Nx monorepo (`apps/api` + `libs/domains`), Express 4, TypeORM 0.3, Zod 3.25, Neon DB (Serverless PostgreSQL).
2. **Feature Inventory**: Complete feature matrix across Platform Admin (`/admin`), Café Management & POS Counter (`/`), Customer Loyalty Portal (`/portal`), and Auth (`/login`, `/set-password`).
3. **Database Schema**: 12 complete TypeORM entity definitions with relations, indices, UUID primary keys, and constraints.
4. **Core Business Logic Engines**:
   - Offers & Loyalty Calculation Engine (stamps, rollover threshold, snapshot safety).
   - Atomic POS Billing Checkout (`recordBill` transaction).
   - Audit-Safe Bill Voiding (`voidBill` transaction with stamp/reward reversal).
   - Multi-Café Customer Wallet & Search Lookups.
   - SQL Aggregation for Analytics (KPIs, daily trend, item repeat buyers).
5. **Complete REST API Specification**: Every endpoint mapped with methods, paths, and auth capabilities.
6. **Neon DB Guidelines**: Connection string formats, SSL configuration, and pooling considerations.
7. **Phased Roadmap**: 6 implementation milestones ready for execution.
