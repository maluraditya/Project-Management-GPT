import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = supabase.from('Update').select('*, user:User(*)').order('forDate', { ascending: false });
    if (projectId) query = query.eq('projectId', projectId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { content, sentiment, blockers, projectId, userId } = body;

    const { data, error } = await supabase
        .from('Update')
        .insert([{ content, sentiment: sentiment || 'ON_TRACK', blockers: blockers || [], projectId, userId }])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
