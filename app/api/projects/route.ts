import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: List all projects
export async function GET() {
    const { data, error } = await supabase
        .from('Project')
        .select('*, owner:User(*)')
        .order('createdAt', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST: Create a new project
export async function POST(request: Request) {
    const body = await request.json();
    const { name, description, ownerId, status, targetDate } = body;

    const { data, error } = await supabase
        .from('Project')
        .insert([{
            name,
            description,
            ownerId,
            status: status || 'PLANNING',
            targetDate
        }])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
