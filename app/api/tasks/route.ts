import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: List tasks (optional filter by projectId)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');

    let query = supabase.from('Task').select('*, assignee:User(*)');

    if (projectId) query = query.eq('projectId', projectId);
    if (assigneeId) query = query.eq('assigneeId', assigneeId);

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST: Create a new task
export async function POST(request: Request) {
    const body = await request.json();
    const { title, description, projectId, assigneeId, priority, dueDate } = body;

    const { data, error } = await supabase
        .from('Task')
        .insert([{
            title,
            description,
            projectId,
            assigneeId,
            priority: priority || 'MEDIUM',
            dueDate
        }])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
