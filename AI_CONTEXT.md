# AI Context - Splitwise Clone MVP

This document serves as the single source of truth for the Splitwise Clone MVP. It will be continually updated as requirements, architecture, schema, UI, and logic change. The final app must be fully buildable and reproducible from this file alone.

## 1. Product Scope and Goals

**Product Goals:**
Build a functional, deployed MVP of a bill-splitting app within a strict 16-hour time constraint.
- **Success Criteria**: 
  - A working relational database.
  - Group management functionality.
  - Four specific types of expense splitting.
  - Real-time expense chat.
  - Balance calculations.
  - Debt settlement.
  - A flawless, highly detailed, and reproducible `AI_CONTEXT.md` file.

**User Personas:**
- Roommates splitting recurring household bills.
- A group of friends splitting costs on a weekend trip.

**Out-of-Scope:**
- Real OAuth/SSO (Google/Facebook login).
- Email/SMS invitations (Users selected from a pre-seeded DB list).
- WebSockets for chat (Short-polling will be used to simulate real-time chat and save time).
- Automated Testing (Jest/Cypress). Strictly manual testing.
- Receipt OCR.
- Currency conversion & multi-currency support.
- Global activity feeds.
- Push notifications.
- Editing or deleting groups once created.
- Removing users from groups.

## 2. Core Workflows

1. **Authentication**: Auth.js v5 (NextAuth): Used with Credentials provider (Email/Password) to provide real database-backed authentication. The user logs in with credentials, and their session is managed securely by Auth.js.
2. **Group Management**: User creates a group and adds existing system users to it. Groups cannot be edited or deleted, and users cannot be removed.
3. **Expense Creation**: A single form inside the group view. The user enters: Description, Total Amount, and selects the Payer (defaults to themselves). Below that, 4 tabs (Equal, Unequal, Percentage, Share). The submit button must remain disabled until the client-side form validation confirms the splits perfectly equal the Total Amount (or 100%). Any remaining cents (e.g., $0.01 from $10/3) are assigned to the payer.
4. **Expense Chat**: Users leave messages in an expense-specific chat (implemented via short-polling). The chat UI must be scoped to individual expenses (tied to `expense_id`), not a general group chat. Users must click into a specific expense to see the polling chat for that specific bill.
5. **Balance View**: Users view a summary of group balances and their individual net debts, simplified using a greedy algorithm.
6. **Debt Settlement**: User records a cash payment to settle a specific debt balance (partial payments allowed).

## 3. Detailed Logic & Rules

### Groups
- **Data Points**: `id`, `name`, `created_at` (No avatars or descriptions).
- **Permissions**: No explicit owner. Any member can add an expense.
- **Scope Limitations**: Cannot be edited or deleted. Users can only be added, not removed.

### Expenses
- **Rounding Errors**: Any remaining cents are automatically assigned to the person who paid the bill.

### Settlements
- **Definition**: A record that User A handed cash to User B.
- **Data Tracking**: Tracks `payer_id`, `payee_id`, `amount`, and `group_id`. No payment methods.
- **Partial Payments**: Allowed. They deduct from net balances during simplification.

### Balance Calculation Algorithm
- Debts are simplified within a group.
- **Backend Strategy**: Calculate net balance (total paid minus total owed) for every user in a group. Use a greedy algorithm: match the person with the highest negative balance (max debtor) to the person with the highest positive balance (max creditor), record a simplified debt, and repeat until all balances are zero.

## 4. Data Model (Relational Schema)

This is the definitive relational schema to be used for the Prisma models:

- **User**: `id`, `name`, `email`
- **Group**: `id`, `name`, `created_at`
- **GroupMember** (Join Table): `group_id`, `user_id`
- **Expense**: `id`, `group_id`, `description`, `total_amount`, `payer_id`, `split_type`, `created_at`
- **ExpenseParticipant**: `id`, `expense_id`, `user_id`, `amount_owed`
  *(Architecture Note: Regardless of the `split_type` chosen on the frontend, the backend will calculate the exact monetary value owed and store it here. This makes balance calculations incredibly fast.)*
- **Message** (For real-time chat): `id`, `expense_id`, `user_id`, `content`, `created_at`
- **Settlement**: `id`, `group_id`, `payer_id`, `payee_id`, `amount`, `created_at`

## 5. Tech Stack, Architecture, and Deployment

### Frontend Architecture
- **Framework/Libraries**: Next.js (App Router, v16+), Tailwind CSS (v4), and shadcn/ui.
- **Routing Structure**:
  - `/login`: Secure login page utilizing NextAuth credentials. Includes 1-Click Demo Login options for reviewers.
  - `/register`: User registration flow with bcrypt password hashing.
  - `/`: Dashboard displaying the list of the user's groups.
  - `/groups/[id]`: The core workspace. Contains UI sections/tabs for adding an expense, viewing the expense list, and viewing group balances.
  - `/groups/[id]/expenses/[expenseId]`: The dedicated expense detail page containing the polling-based chat.

### Backend Architecture & API Design
- **Framework**: Next.js Server Actions directly within the App Router.
- **API Design**: No REST or RPC boilerplate. Server Actions handle all Prisma database mutations natively from the server to maximize speed.
- **Edge Proxy Auth**: We utilize Next.js 16's `src/proxy.ts` (replacing the deprecated `middleware.ts`) alongside NextAuth's edge compatibility to intercept unauthenticated requests and protect dynamic routes.

### Database Choice
- **Database**: PostgreSQL (Neon Serverless).
- **Hosting**: Managed cloud service (Neon serverless pooler).
- **ORM**: Prisma (using `@prisma/adapter-neon` via HTTP/WebSockets since Neon serverless demands it).

### Deployment & Testing
- **Deployment**: Vercel.
- **Testing**: Strictly manual testing (automated tests out of scope). Build verified with Turbopack.

## 6. Implementation Changes & Trade-offs (Post-Build Log)

- **Next.js 15+ Async Params**: Due to breaking changes in Next.js 15+, dynamic route params (`[id]`, `[expenseId]`) are now strictly `Promise` objects. The application explicitly `await`s these params before querying the DB to prevent server crashes.
- **Next.js 16 Proxy Re-architecture**: Next.js 16 deprecated `middleware.ts`. We use `src/proxy.ts` combined with `NextAuth` middleware to secure routes.
- **Prisma Seed with DotEnv**: Standard Prisma seed scripts running through `tsx` don't automatically load Next.js environments. We injected `dotenv` into `seed.ts` to ensure the Neon Database connection string propagates correctly.
- **Tailwind v4 CSS Variable Re-mapping**: Using Next.js's embedded `Geist` font required remapping `--font-sans: var(--font-geist-sans)` inside the Tailwind v4 `@theme inline` block in `globals.css` to properly overwrite default system fonts.
- **Coupling**: Using Next.js Server Actions tightly couples frontend and backend, acceptable for an MVP but would require refactoring for a future mobile app.
- **Real-time Simulation**: Short-polling for chat via `setInterval(..., 3000)` heavily increases database reads. Acceptable for MVP to avoid WebSocket deployment complexity.
- **Monetary Precision**: Dumping remainder cents onto the payer handles rounding errors efficiently, though a true financial app would need precise ledger balancing.
- **Vercel Postinstall Hook**: Vercel by default skips `prisma generate` if it isn't explicitly hooked. We added `"postinstall": "prisma generate"` to `package.json` to ensure the strict Prisma Client types are compiled before Vercel runs `next build`, preventing implicit `any` type cascading errors in the Edge environment.
- **Auth.js Migration**: Migrated away from the mock cookie setup to Auth.js Credentials. Passwords are encrypted with `bcryptjs`. We also split `auth.ts` and `auth.config.ts` to ensure Edge Proxy compatibility.
- **Next.js 15 Server Action Redirect Quirk**: Calling `redirect()` inside a Next.js Server Action throws a hidden `NEXT_REDIRECT` error. If the Server Action is called from a Client Component that wraps it in a `try...catch` block, the redirect error is swallowed and causes an `An unexpected response was received from the server` crash. The workaround is to either use native API endpoints (like `next-auth/react`'s `signOut()`) or to return the new resource ID from the action and perform a client-side `useRouter().push()` navigation.

## 7. Known Limitations
- Modifying or reverting an expense is not implemented (requires complex cascaded updates).
- Real-time events do not trigger push notifications.
- The greedy algorithm handles the vast majority of balance loops but operates locally on the current DB snapshot state rather than an immutable historical ledger.
