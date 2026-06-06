# Spreetail - Splitwise Clone

A modern, full-stack split expense tracking application built as a clone of Splitwise. This application allows users to create groups, add expenses with multiple splitting methods, chat within specific expenses, and automatically calculate and settle optimized debts using a greedy algorithm.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (hosted on [Neon Serverless](https://neon.tech/))
- **ORM**: Prisma v7 (using `@prisma/adapter-neon`)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Icons**: Lucide React
- **Deployment**: Vercel Ready (Edge-compatible architecture)

## Architecture Highlights

- **Server Actions**: Completely REST-free architecture. All database mutations (groups, expenses, chats) utilize native Next.js Server Actions for maximum speed and type safety.
- **Optimized Debt Algorithm**: Includes a greedy algorithm that calculates minimum transactions to settle complex group debts instantly.
- **Vercel Edge Ready**: The Prisma driver is configured specifically to mock `ws` in local Node environments while utilizing native WebSockets on Vercel Edge for maximum performance.

## AI Assistant Used

This project was pair-programmed and largely constructed in collaboration with **Antigravity**, a powerful agentic AI coding assistant designed by the Google DeepMind team. Antigravity handled architectural planning, strict Prisma typing across environments, algorithm development, and dynamic UI component construction within a strict timeframe.

## Local Development Setup

Follow these instructions to get the application running on your local machine.

### 1. Prerequisites

- Node.js (v18+)
- A free [Neon](https://neon.tech/) Serverless Postgres database.

### 2. Clone and Install

```bash
git clone https://github.com/asmitdeb/splitwise-clone.git
cd splitwise-clone
npm install
```

### 3. Environment Variables

Copy the `.env.example` file to create your own `.env` file, and fill in the required variables:

```bash
cp .env.example .env
```

Your `.env` should look like this:
```env
# Example Neon Connection String
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js Secret (Generate one using `npx auth secret`)
AUTH_SECRET="your-generated-auth-secret-here"
```

### 4. Database Setup

Push the Prisma schema to your database and generate the Prisma Client:

```bash
# Push the schema structure
npx prisma db push

# Generate the types
npx prisma generate
```

*(Optional)* Run the seed script to populate your database with dummy users:

```bash
npx tsx prisma/seed.ts
```

### 5. Run the Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You will be greeted with a secure login screen where you can sign up for a new account or utilize the 1-Click Demo Login to instantly explore the app as a pre-seeded user.

## Documentation

For a deeper dive into the product requirements, implementation tradeoffs, and architectural decisions made during development, please refer to the following documents in the root directory:
- `AI_CONTEXT.md`: The complete source of truth for the project context.
- `BUILD_PLAN.md`: The initial build strategy and retrospective on the AI collaboration.
