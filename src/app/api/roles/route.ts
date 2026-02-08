import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// In-memory storage for development (replace with Supabase in production)
const rolesStore: Map<string, unknown> = new Map();

export async function GET() {
    try {
        // Try to fetch from Supabase first
        if (supabase) {
            const { data, error } = await supabase
                .from('custom_roles')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                return NextResponse.json(data);
            }
        }

        // Fallback to in-memory storage
        const roles = Array.from(rolesStore.values());
        return NextResponse.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            description,
            traitWeights,
            idealRanges,
            culturePreference,
            minimumCognitive,
            workStyleRequirements,
            isAiGenerated,
        } = body;

        const role = {
            id: uuidv4(),
            title,
            description,
            trait_weights: traitWeights,
            ideal_ranges: idealRanges,
            culture_preference: culturePreference,
            minimum_cognitive: minimumCognitive,
            work_style_requirements: workStyleRequirements,
            is_ai_generated: isAiGenerated || false,
            created_at: new Date().toISOString(),
        };

        // Try to save to Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('custom_roles')
                .insert([role])
                .select()
                .single();

            if (!error && data) {
                return NextResponse.json(data, { status: 201 });
            }
        }

        // Fallback to in-memory storage
        rolesStore.set(role.id, role);
        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}
