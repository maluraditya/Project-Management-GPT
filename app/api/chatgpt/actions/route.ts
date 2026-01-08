import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Specialized endpoint for ChatGPT to "Quick Add" a task via natural language parsing logic (mocked here, or just direct proxy)
// This endpoint receives a structured JSON from ChatGPT Action and executes it.

export async function POST(request: Request) {
    const body = await request.json();
    const { action, payload } = body; // Action: "create_task" | "log_update" | "get_status"

    if (action === 'create_task') {
        const { title, projectId, priority } = payload;
        const { data, error } = await supabase.from('Task').insert([{ title, projectId, priority: priority || 'MEDIUM' }]).select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "Task created", task: data[0] });
    }

    if (action === 'create_project') {
        const { name, description, status, targetDate } = payload;
        const { data, error } = await supabase.from('Project').insert([{
            name,
            description,
            status: status || 'PLANNING',
            targetDate
        }]).select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "Project created", project: data[0] });
    }

    if (action === 'get_status') {
        // Simple fetch of all projects to let ChatGPT analyze status
        const { data, error } = await supabase.from('Project').select('*').order('createdAt', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ projects: data });
    }

    return NextResponse.json({ message: "Action not supported" }, { status: 400 });
}
