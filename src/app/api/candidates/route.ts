import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Try to fetch from Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('assessment_results')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                return NextResponse.json(data);
            }
        }

        // Return empty array if Supabase not configured
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
}
