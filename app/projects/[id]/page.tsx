'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, MessageSquare } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
       // 1. Fetch Project Details
       // 2. Fetch Tasks
       // 3. Fetch Updates
       // Doing sequentially for simplicity in MVP
       try {
         const pRes = await fetch(`/api/projects?id=${id}`); // Note: API needs adjustment to filter by ID or use new endpoint
         // For MVP we listed all projects on /api/projects. Ideally we need /api/projects/[id]
         // Let's rely on client side filtering for this mock or assume we build the endpoint.
         // Actually, let's just make the implementation robust:
         
         const allProjects = await (await fetch('/api/projects')).json();
         const foundProject = allProjects.find((p: any) => p.id === id);
         setProject(foundProject);

         if (foundProject) {
            const tRes = await fetch(`/api/tasks?projectId=${id}`);
            setTasks(await tRes.json());

            const uRes = await fetch(`/api/updates?projectId=${id}`);
            setUpdates(await uRes.json());
         }

       } catch(e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading project details...</div>;
  if (!project) return <div className="p-8">Project not found.</div>;

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
            <div className="flex gap-2">
              <Button variant="outline">Log Update</Button>
              <Button>Add Task</Button>
            </div>
         </div>
         <p className="text-muted-foreground">{project.description}</p>
         <div className="flex items-center gap-4 mt-2">
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Status: {project.status}</span>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Owner: {project.owner?.name || 'Unassigned'}</span>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tasks Column */}
        <div className="md:col-span-2 space-y-6">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                 <CheckSquare className="h-5 w-5" /> Tasks
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks created yet.</p>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                       <div>
                         <div className="font-medium">{task.title}</div>
                         <div className="text-xs text-muted-foreground mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</div>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded font-medium ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                         {task.status}
                       </span>
                    </div>
                  ))
                )}
             </CardContent>
           </Card>
        </div>

        {/* Updates Column */}
        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Recent Updates
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {updates.length === 0 ? (
                   <p className="text-sm text-muted-foreground">No updates logged.</p>
                ) : (
                   updates.map(update => (
                      <div key={update.id} className="relative pl-4 border-l-2 border-slate-200">
                         <div className="text-xs text-muted-foreground mb-1">{new Date(update.forDate).toLocaleDateString()}</div>
                         <p className="text-sm mb-2">{update.content}</p>
                         {update.sentiment === 'BLOCKED' && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Blocked</span>
                         )}
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
