# Splitwise Clone MVP Implementation Plan

This plan details the step-by-step approach to building the 3-day MVP of the Splitwise clone based strictly on the agreed `AI_CONTEXT.md`.

## User Review Required

> [!IMPORTANT]
> Please review this build plan to ensure it perfectly aligns with our 16-hour MVP scope before we write any code.
> Let me know if you approve this plan to begin execution!

## Proposed Steps

### Step 1: Project Initialization & Dependencies
- Bootstrap Next.js application using App Router (`npx create-next-app@latest`).
- Install Tailwind CSS and Shadcn UI.
- Install Prisma and initialize it (`npx prisma init`).
- Configure environment variables for the PostgreSQL database (Neon/Supabase).

### Step 2: Database Setup & Seeding
- Define the Prisma schema strictly adhering to the `AI_CONTEXT.md` Data Model.
- Create initial migrations.
- Write a database seed script to populate mock users so the Mock Authentication flow will work correctly.

### Step 3: Mock Authentication & Layouts
- Implement the `/login` route fetching users from DB to populate a dropdown.
- Store the selected `user_id` in a plain cookie.
- Create middleware or a wrapper to enforce the mock session cookie across protected routes.
- Build the core application shell (navigation, user session indicator).

### Step 4: Dashboard & Group Management (Groups)
- Implement Server Actions for creating groups and adding members.
- Build the `/` Dashboard to display user's groups.
- Build a modal/form for creating a group and selecting seeded users to add to the group.

### Step 5: Group Workspace & Expense Creation
- Build the `/groups/[id]` route structure with tabs/sections.
- Implement the "Add Expense" form UI containing description, amount, payer, and the 4 split type tabs (Equal, Unequal, Percentage, Share).
- Add strict client-side validation logic for the splits.
- Implement the backend Server Action to create the `Expense` and calculate/insert exact amounts into `ExpenseParticipant`.

### Step 6: Expense List & Debt Settlements
- Display the list of expenses within the group.
- Implement the "Add Settlement" flow to record cash payments between users.
- Implement Server Action to save `Settlement` records.

### Step 7: Balance Calculation Algorithm
- Implement the backend logic to calculate net balances (paid minus owed).
- Write the greedy algorithm to simplify debts and determine who owes whom.
- Display the simplified balances and net debts in the `/groups/[id]` view.

### Step 8: Expense Chat (Short-polling)
- Implement the chat UI scoped to individual expenses. Users will click into a specific expense from the list to see this chat.
- Implement Server Action to save new chat messages.
- Add client-side logic to short-poll the server for new messages on a set interval.

### Step 9: Vercel Deployment & Polish
- Deploy the project to Vercel.
- Verify environment variables on Vercel.
- Do a final manual testing sweep of all workflows.

## Verification Plan

### Manual Verification
- We will run the dev server and manually verify:
  - Mock Auth via Cookie
  - Group creation and participant adding
  - Expense creation validation rules and backend calculation logic
  - Correct rendering of simplified balances
  - Real-time simulated chat through multiple browser windows (polling)
- Deploy to Vercel and run the same tests in the production environment.
