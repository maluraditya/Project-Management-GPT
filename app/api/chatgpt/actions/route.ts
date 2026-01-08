import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Specialized endpoint for ChatGPT to "Quick Add" a task via natural language parsing logic (mocked here, or just direct proxy)
// This endpoint receives a structured JSON from ChatGPT Action and executes it.

export async function POST(request: Request) {
    const body = await request.json();
    const { action, payload } = body; // Action: "create_task" | "log_update" | "get_status"

    if (action === 'create_task') {
        const { title, projectId, priority } = payload;
        // Helper logic to find project by name if ChatGPT provided a fuzzy name could go here, 
        // but for MVP we assume ChatGPT sends IDs or we do a lookup.

        const { data, error } = await supabase.from('Task').insert([{ title, projectId, priority }]).select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "Task created", task: data[0] });
    }

    return NextResponse.json({ message: "Action not supported" }, { status: 400 });
}
