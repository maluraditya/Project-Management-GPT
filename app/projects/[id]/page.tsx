'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Edit, ListTodo, MessageSquare, Settings, User } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  targetDate: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
};

type Update = {
  id: string;
  content: string;
  sentiment: string;
  forDate: string;
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  PLANNING: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ON_HOLD: { bg: 'bg-amber-100', text: 'text-amber-700' },
  COMPLETED: { bg: 'bg-violet-100', text: 'text-violet-700' },
};

const taskStatusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const [projectRes, tasksRes, updatesRes] = await Promise.all([
      supabase.from('Project').select('*').eq('id', id).single(),
      supabase.from('Task').select('*').eq('projectId', id).order('createdAt', { ascending: false }),
      supabase.from('Update').select('*').eq('projectId', id).order('forDate', { ascending: false }),
    ]);
    setProject(projectRes.data);
    setTasks(tasksRes.data || []);
    setUpdates(updatesRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Project not found</p>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Projects
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={`${statusConfig[project.status]?.bg} ${statusConfig[project.status]?.text} border-0`}>
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl">{project.description || "No description"}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ListTodo className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Clock className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {project.targetDate ? format(new Date(project.targetDate), 'MMM d') : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Target Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="tasks" className="gap-2">
              <ListTodo className="h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Updates
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Project Tasks</h3>
              <CreateTaskModal projectId={project.id} projectName={project.name} onCreated={fetchData} />
            </div>

            {tasks.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks yet</p>
                  <CreateTaskModal projectId={project.id} projectName={project.name} onCreated={fetchData} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="font-medium">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${taskStatusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'warning' : 'secondary'}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <h3 className="text-lg font-semibold">Project Updates</h3>
            {updates.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No updates logged yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id} className="shadow-sm">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">{update.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(update.forDate), 'PPP')}
                          </p>
                        </div>
                        <Badge variant={update.sentiment === 'BLOCKED' ? 'destructive' : update.sentiment === 'AT_RISK' ? 'warning' : 'success'}>
                          {update.sentiment}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage your project configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
