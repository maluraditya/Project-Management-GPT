'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { Calendar, CheckCircle2, Clock, FolderOpen } from "lucide-react";
import { format } from 'date-fns';

type Project = {
    id: string;
    name: string;
    description: string;
    status: string;
    targetDate: string;
    createdAt: string;
};

const statusConfig: Record<string, { color: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' }> = {
    PLANNING: { color: 'bg-blue-500', variant: 'info' },
    ACTIVE: { color: 'bg-emerald-500', variant: 'success' },
    ON_HOLD: { color: 'bg-amber-500', variant: 'warning' },
    COMPLETED: { color: 'bg-violet-500', variant: 'secondary' },
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchProjects() {
        const { data } = await supabase
            .from('Project')
            .select('*')
            .order('createdAt', { ascending: false });
        setProjects(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                            Projects
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your initiatives and track progress</p>
                    </div>
                    <CreateProjectModal onCreated={fetchProjects} />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <Card className="shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-6">Create your first project to get started</p>
                            <CreateProjectModal onCreated={fetchProjects} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link href={`/projects/${project.id}`} key={project.id}>
                                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                                    <div className={`h-2 ${statusConfig[project.status]?.color || 'bg-slate-400'}`} />
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {project.name}
                                            </CardTitle>
                                            <Badge variant={statusConfig[project.status]?.variant || 'default'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">
                                            {project.description || "No description provided."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {project.targetDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Due {format(new Date(project.targetDate), 'MMM d, yyyy')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>Created {format(new Date(project.createdAt), 'MMM d')}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
