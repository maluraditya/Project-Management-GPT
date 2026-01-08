-- FIX: Allow anonymous (anon key) access for MVP
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS entirely for MVP (Simplest)
-- ALTER TABLE "Project" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Update" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Decision" DISABLE ROW LEVEL SECURITY;

-- Option 2: Add permissive policies for anon role (Recommended for testing)
-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Enable all for users" ON "Project";
DROP POLICY IF EXISTS "Enable all for users" ON "Task";
DROP POLICY IF EXISTS "Enable all for users" ON "Update";
DROP POLICY IF EXISTS "Enable all for users" ON "Decision";

-- Create new policies that allow anon access
CREATE POLICY "Allow anon full access" ON "Project" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon full access" ON "Task" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon full access" ON "Update" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon full access" ON "Decision" FOR ALL USING (true) WITH CHECK (true);
