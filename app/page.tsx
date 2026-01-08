'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, Clock, FolderKanban, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';

type Project = { id: string; name: string; status: string; createdAt: string };
type Task = { id: string; title: string; status: string; priority: string; projectId: string; createdAt: string };
type Update = { id: string; content: string; sentiment: string; forDate: string; user?: { name: string } };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#3b82f6',
  ACTIVE: '#10b981',
  ON_HOLD: '#f59e0b',
  COMPLETED: '#6366f1',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [projectsRes, tasksRes, updatesRes] = await Promise.all([
        supabase.from('Project').select('*').order('createdAt', { ascending: false }),
        supabase.from('Task').select('*').order('createdAt', { ascending: false }),
        supabase.from('Update').select('*, user:User(name)').order('forDate', { ascending: false }).limit(5),
      ]);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setUpdates(updatesRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Compute stats
  const activeProjects = projects.filter(p => ['ACTIVE', 'PLANNING'].includes(p.status)).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const blockedUpdates = updates.filter(u => u.sentiment === 'BLOCKED').length;

  // Chart data
  const projectStatusData = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const taskPriorityData = Object.entries(
    tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Activity over time (tasks created per day, last 7 days)
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = tasks.filter(t => t.createdAt?.startsWith(dateStr)).length;
    return { date: date.toLocaleDateString('en-US', { weekday: 'short' }), tasks: count };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Your operational command center</p>
          </div>
          <Link href="/projects">
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            description={`${projects.length} total projects`}
            icon={FolderKanban}
            trend={activeProjects > 0 ? '+' : ''}
            color="blue"
          />
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            description={`${completedTasks} completed`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Completion Rate"
            value={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) + '%' : '0%'}
            description="Tasks finished"
            icon={TrendingUp}
            color="violet"
          />
          <StatCard
            title="Blockers"
            value={blockedUpdates}
            description="Reported issues"
            icon={AlertTriangle}
            color={blockedUpdates > 0 ? "red" : "slate"}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Project Status Pie */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Projects by Status</CardTitle>
              <CardDescription>Distribution of project states</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No projects yet</div>
              )}
            </CardContent>
          </Card>

          {/* Tasks by Priority Bar */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Tasks by Priority</CardTitle>
              <CardDescription>Workload distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {taskPriorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {taskPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No tasks yet</div>
              )}
            </CardContent>
          </Card>

          {/* Activity Line Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Activity (Last 7 Days)</CardTitle>
              <CardDescription>Tasks created per day</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="lg:col-span-4 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates logged yet. Use ChatGPT or the app to log daily updates.</p>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex-1">
                      <p className="text-sm">{update.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(update.forDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={update.sentiment === 'BLOCKED' ? 'destructive' : update.sentiment === 'AT_RISK' ? 'warning' : 'success'}>
                      {update.sentiment}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Tasks */}
          <Card className="lg:col-span-3 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.slice(0, 5).length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks created yet.</p>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.status}</p>
                    </div>
                    <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'warning' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, trend, color }: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    red: 'from-red-500 to-red-600',
    slate: 'from-slate-400 to-slate-500',
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
