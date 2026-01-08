'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Project = { id: string; name: string };

export function CreateTaskModal({
    projectId,
    projectName,
    onCreated
}: {
    projectId?: string;
    projectName?: string;
    onCreated?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!projectId) {
                const { data } = await supabase.from('Project').select('id, name');
                setProjects(data || []);
            }
        };

        const fetchUsers = async () => {
            const { data } = await supabase.from('User').select('id, name, email');
            setUsers(data || []);
        };

        if (open) {
            fetchProjects();
            fetchUsers();
        }
    }, [projectId, open]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !selectedProjectId) return;

        setLoading(true);
        const { error } = await supabase.from('Task').insert([{
            title: title.trim(),
            description: description.trim() || null,
            priority,
            projectId: selectedProjectId,
            status: 'TODO',
            assigneeId: assigneeId || null,
            dueDate: dueDate || null,
        }]);

        setLoading(false);
        if (!error) {
            setTitle('');
            setDescription('');
            setPriority('MEDIUM');
            setAssigneeId('');
            setDueDate('');
            setOpen(false);
            onCreated?.();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            {projectName ? `Adding task to ${projectName}` : 'Add a new task to a project'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Fix login bug"
                                required
                            />
                        </div>
                        {!projectId && (
                            <div className="grid gap-2">
                                <Label htmlFor="project">Project *</Label>
                                <select
                                    id="project"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select a project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="assignee">Assignee</Label>
                                <select
                                    id="assignee"
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Task details"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
