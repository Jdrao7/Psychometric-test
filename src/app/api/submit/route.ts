import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
    calculateTraitScores,
    extractWorkValues,
    extractWorkStyle,
    calculateCompositeInsights,
    calculateRoleFits,
    generateStrengths,
    generateRiskAreas,
    calculateConsistency,
    calculateAvgResponseTime,
} from '@/lib/scoring';
import { Response, AssessmentResult } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const { responses } = await request.json() as { responses: Response[] };

        if (!responses || !Array.isArray(responses)) {
            return NextResponse.json(
                { error: 'Invalid request: responses array required' },
                { status: 400 }
            );
        }

        // Calculate all scores
        const traits = calculateTraitScores(responses);
        const workValues = extractWorkValues(responses);
        const workStyle = extractWorkStyle(responses);
        const compositeInsights = calculateCompositeInsights(traits, workValues);
        const roleFits = calculateRoleFits(traits, workValues, workStyle);
        const strengths = generateStrengths(traits, workStyle);
        const riskAreas = generateRiskAreas(traits, workValues);
        const consistencyScore = calculateConsistency(responses);
        const avgResponseTime = calculateAvgResponseTime(responses);

        const result: AssessmentResult = {
            id: crypto.randomUUID(),
            traits,
            workValues,
            workStyle,
            compositeInsights,
            roleFits,
            strengths,
            riskAreas,
            consistencyScore,
            avgResponseTime,
            createdAt: new Date().toISOString(),
        };

        // Try to save to Supabase
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('assessment_results')
                    .insert([{
                        id: result.id,
                        ext: traits.EXT,
                        con: traits.CON,
                        emo: traits.EMO,
                        risk: traits.RISK,
                        dec: traits.DEC,
                        mot: traits.MOT,
                        cog: traits.COG,
                        work_values: workValues,
                        work_style: workStyle,
                        composite_insights: compositeInsights,
                        role_fits: roleFits,
                        strengths: strengths,
                        risk_areas: riskAreas,
                        consistency_score: consistencyScore,
                        avg_response_time: avgResponseTime,
                    }]);

                if (error) {
                    console.error('Supabase insert error:', error);
                }
            } catch (dbError) {
                console.error('Database error:', dbError);
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json(
            { error: 'Failed to process assessment' },
            { status: 500 }
        );
    }
}
