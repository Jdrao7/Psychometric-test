import { NextRequest, NextResponse } from 'next/server';
import { AssessmentResult } from '@/lib/types';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const result = await request.json() as AssessmentResult;

        if (!process.env.CEREBRAS_API_KEY) {
            return NextResponse.json({ overview: null });
        }

        const prompt = `
Generate a concise, encouraging, and insightful professional summary for a candidate with the following psychometric profile:

Traits (0-100):
- Extraversion: ${result.traits.EXT}
- Conscientiousness: ${result.traits.CON}
- Emotional Stability: ${result.traits.EMO}
- Risk Tolerance: ${result.traits.RISK}
- Decision Speed: ${result.traits.DEC}
- Motivation: ${result.traits.MOT}
- Cognitive Ability: ${result.traits.COG}

Work Style:
- Team Role: ${result.workStyle.teamRole}
- Conflict Style: ${result.workStyle.conflictStyle}
- Communication: ${result.workStyle.communicationStyle}

Key Strengths: ${result.strengths.join(', ')}
Potential Risk Areas: ${result.riskAreas.join(', ')}

The summary should be about 3-4 paragraphs long. Focus on their professional potential, ideal work environment, and how they likely interact with teams. Use a supportive and professional tone.
        `;

        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3.1-8b',
        }) as any;

        const overview = completion.choices[0]?.message?.content || 'Unable to generate insight.';

        return NextResponse.json({ overview });

    } catch (error) {
        console.error('AI Overview error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI overview' },
            { status: 500 }
        );
    }
}
