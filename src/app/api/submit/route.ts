import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
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
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const responses: Response[] = body.responses;

        if (!responses || responses.length === 0) {
            return NextResponse.json(
                { error: 'No responses provided' },
                { status: 400 }
            );
        }

        // Calculate all scores and insights
        const traits = calculateTraitScores(responses);
        const workValues = extractWorkValues(responses);
        const workStyle = extractWorkStyle(responses);
        const compositeInsights = calculateCompositeInsights(traits, workValues);
        const roleFits = calculateRoleFits(traits, workValues, workStyle);
        const strengths = generateStrengths(traits, workStyle);
        const riskAreas = generateRiskAreas(traits, workValues);
        const consistency = calculateConsistency(responses);
        const avgResponseTime = calculateAvgResponseTime(responses);

        const resultId = uuidv4();

        const result: AssessmentResult = {
            id: resultId,
            createdAt: new Date(),
            traits,
            workValues,
            workStyle,
            compositeInsights,
            roleFits,
            strengths,
            riskAreas,
            qualityMetrics: {
                consistency,
                avgResponseTime,
            },
        };

        // Try to save to Supabase (graceful fallback if not configured)
        try {
            if (supabase) {
                await supabase.from('assessment_results').insert({
                    id: resultId,
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
                    strengths,
                    risk_areas: riskAreas,
                    consistency_score: consistency,
                    avg_response_time: avgResponseTime,
                });
            }
        } catch (dbError) {
            console.log('Supabase not configured, results not persisted');
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing assessment:', error);
        return NextResponse.json(
            { error: 'Failed to process assessment' },
            { status: 500 }
        );
    }
}
