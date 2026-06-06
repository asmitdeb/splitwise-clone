# Splitwise Clone MVP: Build Plan and Retrospective

This document summarizes the research, architecture, collaboration process, and tradeoffs made during the creation of the Splitwise Clone MVP, fulfilling the final assignment requirements.

## 1. Product Research

**How I studied Splitwise:**
I analyzed the core user journeys of the existing Splitwise application, specifically focusing on the most critical paths: logging in, creating groups of friends, adding expenses, and settling debts. I stripped away all premium features (like receipt scanning and currency conversion) to identify the absolute minimum viable feature set.

**What I learned:**
The complexity of Splitwise isn't in the UI, but in the mathematical resolution of debts. The core value proposition is preventing money arguments by ensuring exact mathematical splits (handling rounding) and simplifying overlapping peer-to-peer debts into minimal cash transactions.

**What workflows I identified:**
1. **Authentication:** Identifying who the current user is.
2. **Group Management:** Creating isolated workspaces (groups) for specific sets of users (e.g., "Weekend Trip").
3. **Expense Creation:** Recording a bill paid by one person, split across multiple people using different methodologies (Equal, Unequal, Percentages, Shares).
4. **Expense Chat:** Discussing specific bills.
5. **Debt Resolution:** Viewing simplified net balances and recording manual cash payments to settle those balances.

**What product assumptions I made:**
- Real authentication is unnecessary for proving the MVP mechanics; mock authentication via cookies is sufficient.
- Users do not need to edit or delete expenses/groups for a v1 MVP.
- A "greedy algorithm" resolving the highest debtor with the highest creditor is an acceptable and efficient way to simplify group debts without needing a complex graph-theory approach.

## 2. Architecture

**Tech Stack:**
- Next.js (App Router, v15/v16+) for both frontend UI and backend API logic.
- Tailwind CSS (v4) and shadcn/ui for rapid, aesthetic component development.
- Prisma ORM (`@prisma/client` and `@prisma/adapter-neon`).
- PostgreSQL hosted on Neon (Serverless).

**Database Schema:**
- `User`: Core identity (`id`, `name`, `email`).
- `Group`: Isolated containers for expenses.
- `GroupMember`: Join table linking Users to Groups.
- `Expense`: A recorded bill (`total_amount`, `payer_id`, `split_type`).
- `ExpenseParticipant`: The exact calculated dollar amount owed by each person for a specific expense.
- `Message`: Chat messages tied directly to an `expense_id`.
- `Settlement`: Records of cash payments between users to resolve debts.

**API Design:**
- **Zero REST/GraphQL**: The application strictly utilizes Next.js Server Actions. Client components pass form data directly to server-side functions which interact with Prisma and subsequently trigger `revalidatePath` to update the UI instantly without manual state management.

**Frontend Structure:**
- `/login`: Mock auth dropdown. Sets a session cookie.
- `src/proxy.ts`: Next.js 16 Edge proxy (replacing middleware) that intercepts unauthenticated requests.
- `/`: Dashboard showing the user's groups.
- `/groups/[id]`: Group workspace with Shadcn Tabs for "Expenses" and "Balances".
- `/groups/[id]/expenses/[expenseId]`: Dedicated expense view featuring the auto-polling chat interface.

**Deployment Approach:**
- Built to be deployed instantly on **Vercel**. Since the app uses Server Actions and a Neon serverless PostgreSQL driver, it requires zero custom Docker/Node server configuration.
- We explicitly added a `"postinstall": "prisma generate"` hook in `package.json`. This forces Vercel's CI to generate the strict Prisma v7 types before executing `next build`, bypassing build-time `any` type inference errors.

## 3. AI Collaboration Process

**How I instructed the AI:**
The AI was instructed to act as a junior engineer pair-programming to complete an internship assignment within a strict 16-hour timeframe constraint. It was explicitly told *not* to jump to code, but to deeply question product requirements and edge cases first.

**What questions the AI asked:**
The AI probed deeply into scope:
- Should authentication be real (Auth0) or mocked?
- How should rounding errors be handled when dividing $10 by 3?
- Should chat be global to the group or scoped to an expense?
- What happens if a user is removed from a group with active debts?
- Are we deploying to a persistent cloud DB or using SQLite locally?

**How I answered:**
I mandated extreme scope-cutting to ensure the 16-hour deadline could be met:
- Mock auth only.
- Rounding errors dump the remaining cents onto the payer.
- Chat must be scoped specifically to the expense.
- Users cannot be removed from groups (avoiding complex cascading debt logic).
- We must use Neon Postgres from minute one to avoid SQLite-to-Postgres migration headaches later.

**How the plan evolved:**
Initially, the plan missed the explicit requirement that chat was scoped to *expenses*, not groups. I corrected the AI on this, and the plan was updated to include the `/groups/[id]/expenses/[expenseId]` route. Later, we migrated the deployment target to Next.js 16 standards (updating `middleware` to `proxy` and `await`ing route params).

**How AI_CONTEXT.md was maintained:**
`AI_CONTEXT.md` was established as the ultimate Source of Truth. After every architectural decision (e.g., using Neon adapter, switching to Next.js 16 proxy, designing the greedy algorithm), the AI was instructed to completely rewrite the context file to ensure an external evaluator could paste it into a blank IDE and reproduce the exact same app.

## 4. Tradeoffs

**What I simplified:**
- **WebSockets:** Real-time chat was simplified to use `setInterval` short-polling (every 3 seconds) instead of a dedicated WebSocket server. This drastically simplified deployment while maintaining MVP UX.
- **Group Mutability:** Groups and expenses cannot be edited or deleted.

**What I hardcoded:**
- **Users:** The database is pre-seeded with 5 specific mock users ("Alice Roommate", etc.). No signup flow exists.

**What I avoided:**
- **Complex Financial Ledgers:** Instead of an immutable double-entry accounting ledger, the app dynamically calculates net balances on-the-fly by querying all expenses and settlements in real-time.
- **Push Notifications & Emails:** Completely omitted.

**What I would improve with more time:**
1. Implement real JWT-based authentication via NextAuth/Auth.js.
2. Add a comprehensive activity feed showing an audit log of who added what expense.
3. Migrate the chat from short-polling to Pusher or Supabase Realtime to save database read costs.
4. Allow editing/deleting expenses with robust logic to reverse the associated `ExpenseParticipants` and recalculate debts gracefully.
