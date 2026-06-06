# Key AI Prompts & Collaboration Log

This document serves as a record of the key prompts, instructions, and architectural questions used to guide the Antigravity AI throughout the development of the Spreetail Splitwise Clone.

## 1. Initial Architecture & Scope Definition

**Prompt:**
> Frontend Architecture:
> Framework/Libraries: Next.js (App Router), Tailwind CSS, and shadcn/ui. This ensures we don't waste time writing custom CSS or complex component states.
> Routing Structure: /login, /, /groups/[id]
> Backend Architecture & API Design: We will use Next.js Server Actions directly within the App Router. No REST or RPC boilerplate.
> Database: PostgreSQL. Hosting: We will use a managed cloud service like Neon or Supabase from minute one to avoid local-to-cloud migration issues later. We will use Prisma as the ORM.

## 2. Project Initialization

**Prompt:**
> The build plan looks excellent and perfectly aligns with our 16-hour scope. Correction for Step 8: Please remember that the chat UI must be scoped to individual expenses (tied to expense_id), not a general group chat.
> I approve this plan. Let's immediately execute Step 1 and Step 2. Please provide the exact terminal commands to initialize the Next.js/Prisma project, and then generate the complete schema.prisma file based on our agreed data model so I can push it to the database.

## 3. Strict Documentation Requirements

**Prompt:**
> Core Requirement: AI_CONTEXT.md. This is one of the most important parts of the assignment. You must create and maintain a file called AI_CONTEXT.md. This file should contain the full working context used to generate the app.
> Your BUILD_PLAN.md should summarize: Product Research, Architecture, AI Collaboration Process, and Tradeoffs. Make sure that BUILD_PLAN.md reflects all changes made after it was last updated.

## 4. Debugging & Troubleshooting

**Prompt:**
> What is this error? ⨯ Error: [object ErrorEvent] GET / 500 in 19.7s (next.js: 5.6s, proxy.ts: 277ms, application-code: 13.8s)

**Prompt:**
> Type error: Parameter 'm' implicitly has an 'any' type. Next.js build worker exited with code: 1 and signal: null

**Prompt:**
> can you please make the changes once again? and make sure everything is in order so that these errors are eliminated? local build works fine but vercel build fails

## 5. Performance & Architecture Inquiries

**Prompt:**
> why is everything so slow? is it because of neon? shall I use supabase? what's the issue?

**Prompt:**
> Will it be possible to convert chat from polling to ws? what are the benefits/drawbacks?

## 6. UX Enhancements & Final Polish

**Prompt:**
> can you add loading states? otherwise its hard to know that something is rendering/loading

**Prompt:**
> update README.md with setup instructions and the AI used


