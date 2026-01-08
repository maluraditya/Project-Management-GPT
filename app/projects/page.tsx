'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from 'next/link';

// Mock types for now, eventually share with Prisma types
type Project = {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch projects from our API
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                const data = await res.json();
                setProjects(data);
            } catch (error) {
                console.error('Failed to fetch projects', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage your ongoing initiatives.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading projects...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="leading-snug">{project.name}</CardTitle>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                            {project.status}
                                        </span>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {project.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        Created {new Date(project.createdAt).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && projects.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No projects found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
                    <Button variant="outline">Create Project</Button>
                </div>
            )}
        </div>
    );
}
