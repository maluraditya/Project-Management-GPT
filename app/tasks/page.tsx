'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { supabase } from "@/lib/supabaseClient";
import { GripVertical, CheckCircle2, Clock, Play, Eye } from "lucide-react";

type Task = {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    projectId: string;
    project?: { name: string };
    assignee?: { name: string | null; avatarUrl: string | null };
    dueDate?: string;
};

const columns = [
    { id: 'TODO', label: 'To Do', icon: Clock, color: 'border-slate-400' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Play, color: 'border-blue-500' },
    { id: 'REVIEW', label: 'Review', icon: Eye, color: 'border-amber-500' },
    { id: 'DONE', label: 'Done', icon: CheckCircle2, color: 'border-emerald-500' },
];

const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
    URGENT: 'bg-red-200 text-red-800',
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchTasks() {
        const { data } = await supabase
            .from('Task')
            .select('*, project:Project(name), assignee:User(name, avatarUrl)')
            .order('createdAt', { ascending: false });
        setTasks(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    async function handleDragEnd(result: DropResult) {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        // Optimistic update
        setTasks(prev =>
            prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );

        // Persist to DB
        await supabase.from('Task').update({ status: newStatus }).eq('id', taskId);
    }

    function getTasksByStatus(status: string) {
        return tasks.filter(t => t.status === status);
    }

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
                            Tasks
                        </h1>
                        <p className="text-muted-foreground mt-1">Drag and drop to update task status</p>
                    </div>
                    <CreateTaskModal onCreated={fetchTasks} />
                </div>

                {/* Kanban Board */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {columns.map((column) => (
                            <div key={column.id} className="flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <column.icon className="h-5 w-5 text-muted-foreground" />
                                    <h2 className="font-semibold text-lg">{column.label}</h2>
                                    <Badge variant="secondary" className="ml-auto">
                                        {getTasksByStatus(column.id).length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 min-h-[400px] rounded-xl p-3 transition-colors ${snapshot.isDraggingOver
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : 'bg-slate-100/50 dark:bg-slate-800/30'
                                                }`}
                                        >
                                            <div className="space-y-3">
                                                {getTasksByStatus(column.id).map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`group transition-all ${snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                                                    }`}
                                                            >
                                                                <Card className={`border-l-4 ${column.color} shadow-sm hover:shadow-lg transition-shadow`}>
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-start gap-2">
                                                                            <div
                                                                                {...provided.dragHandleProps}
                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                                                                            >
                                                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-sm truncate">{task.title}</p>
                                                                                {task.project?.name && (
                                                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                                                        {task.project.name}
                                                                                    </p>
                                                                                )}
                                                                                <div className="flex items-center gap-2 mt-2">
                                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] || 'bg-slate-100'}`}>
                                                                                        {task.priority}
                                                                                    </span>
                                                                                    {task.dueDate && (
                                                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                                                        </span>
                                                                                    )}
                                                                                    {task.assignee && (
                                                                                        <div className="ml-auto flex items-center gap-1" title={task.assignee.name || 'Assigned'}>
                                                                                            <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium overflow-hidden">
                                                                                                {task.assignee.avatarUrl ? (
                                                                                                    <img src={task.assignee.avatarUrl} alt={task.assignee.name || ''} className="h-full w-full object-cover" />
                                                                                                ) : (
                                                                                                    (task.assignee.name || '?').charAt(0).toUpperCase()
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
