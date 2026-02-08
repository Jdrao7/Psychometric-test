import { NextRequest, NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = process.env.CEREBRAS_API_KEY
    ? new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY })
    : null;

export async function POST(request: NextRequest) {
    try {
        if (!cerebras) {
            return NextResponse.json(
                { error: 'Cerebras API not configured', role: null },
                { status: 200 }
            );
        }

        const { prompt } = await request.json();

        const systemPrompt = `You are an HR expert helping recruiters define role requirements. Given a job description, generate trait requirements for candidate matching.

You must respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "title": "Role Title",
  "description": "Brief role description",
  "culture": "startup" | "corporate" | "hybrid",
  "minimumCognitive": 50-80,
  "traits": {
    "EXT": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "CON": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "EMO": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "RISK": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "DEC": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "MOT": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 },
    "COG": { "weight": 0.5-2.0, "min": 0-100, "max": 0-100 }
  }
}

Trait meanings:
- EXT (Extraversion): Social energy, assertiveness. Higher for sales, leadership. Lower OK for technical roles.
- CON (Conscientiousness): Organization, reliability. Higher for operations, project management.
- EMO (Emotional Stability): Stress handling. Higher for high-pressure roles.
- RISK (Risk Tolerance): Comfort with uncertainty. Higher for startups, innovation roles.
- DEC (Decision Speed): Quick vs deliberate. Higher for fast-paced environments.
- MOT (Motivation): Drive and ambition. Important for growth roles.
- COG (Cognitive Ability): Problem-solving. Higher for technical, analytical roles.

Weight guidelines:
- 0.5 = Low importance
- 1.0 = Normal importance
- 1.5 = High importance
- 2.0 = Critical requirement

Set min/max to define the ideal range. Score outside this range penalizes the match.`;

        const completion = await cerebras.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate role requirements for: ${prompt}` }
            ],
            model: 'llama-3.3-70b',
            max_tokens: 500,
        });

        const choices = completion.choices as Array<{ message?: { content?: string } }>;
        const content = choices[0]?.message?.content || '';

        try {
            // Try to parse the JSON response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const role = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ role });
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
        }

        return NextResponse.json({ error: 'Failed to parse AI response', role: null });
    } catch (error) {
        console.error('Error generating role:', error);
        return NextResponse.json(
            { error: 'Failed to generate role', role: null },
            { status: 200 }
        );
    }
}
