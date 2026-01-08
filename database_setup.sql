-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "Sentiment" AS ENUM ('ON_TRACK', 'AT_RISK', 'BLOCKED');

-- Create Tables

-- USERS (Mirrors Supabase Auth but adds our fields)
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "avatarUrl" TEXT,
  "role" "Role" DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE "Project" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ProjectStatus" DEFAULT 'PLANNING',
  "ownerId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "targetDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TASKS
CREATE TABLE "Task" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "TaskStatus" DEFAULT 'TODO',
  "priority" "TaskPriority" DEFAULT 'MEDIUM',
  "projectId" UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "assigneeId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "parentTaskId" UUID REFERENCES "Task"("id") ON DELETE SET NULL,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UPDATES
CREATE TABLE "Update" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "content" TEXT NOT NULL,
  "sentiment" "Sentiment" DEFAULT 'ON_TRACK',
  "blockers" TEXT[], -- Array of strings
  "forDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "projectId" UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "userId" UUID REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DECISIONS
CREATE TABLE "Decision" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "context" TEXT,
  "outcome" TEXT NOT NULL,
  "projectId" UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "decidedBy" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- For MVP: Allow authenticated users to do everything.
-- We will refine this later.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Update" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Decision" ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all for users" ON "User" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for users" ON "Project" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for users" ON "Task" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for users" ON "Update" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for users" ON "Decision" FOR ALL USING (auth.role() = 'authenticated');
