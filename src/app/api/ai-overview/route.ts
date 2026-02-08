import { NextRequest, NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = process.env.CEREBRAS_API_KEY
    ? new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY })
    : null;

export async function POST(request: NextRequest) {
    try {
        if (!cerebras) {
            return NextResponse.json(
                { error: 'Cerebras API not configured', overview: null },
                { status: 200 }
            );
        }

        const body = await request.json();
        const { traits, workValues, workStyle, compositeInsights, roleFits, strengths, riskAreas } = body;

        const prompt = `You are a direct, no-nonsense hiring consultant reviewing a candidate's psychometric assessment. Your job is to give HONEST, BALANCED feedback - not to make them feel good.

## Assessment Results

### Trait Scores (0-100):
- Extraversion: ${traits.EXT}
- Conscientiousness: ${traits.CON}
- Emotional Stability: ${traits.EMO}
- Risk Tolerance: ${traits.RISK}
- Decision Speed: ${traits.DEC}
- Motivation Orientation: ${traits.MOT}
- Cognitive Ability: ${traits.COG}

### Work Values:
- Primary: ${workValues.primary}
- Secondary: ${workValues.secondary}

### Work Style:
- Team Role: ${workStyle.teamRole}
- Conflict Style: ${workStyle.conflictStyle}
- Communication Style: ${workStyle.communicationStyle}

### Culture Fit:
- Startup: ${compositeInsights.cultureFit.startup}%
- Corporate: ${compositeInsights.cultureFit.corporate}%
- Remote Readiness: ${compositeInsights.remoteReadiness}%
- Career Path: ${compositeInsights.careerPath}

### Top Role Matches:
${roleFits.slice(0, 3).map((r: { title: string; fitPercentage: number }) => `- ${r.title}: ${r.fitPercentage}%`).join('\n')}

---

Provide a BALANCED assessment with this structure:

**STRENGTHS (What makes you valuable):**
List 3-4 genuine strengths based on high scores. Be specific about how these help at work.

**CONCERNS (What could hold you back):**
List 2-3 real concerns based on low scores or trait extremes. Don't sugar-coat. If emotional stability is 45, say it directly - stress management may be a challenge. If cognitive is low, mention it.

**HONEST CAREER ADVICE:**
Based on the role matches and culture fit, give direct advice. If they're not suited for a role, say so. If a startup would eat them alive, warn them.

**BOTTOM LINE:**
One sentence summary - what type of roles should they pursue and what should they work on?

IMPORTANT RULES:
- DO NOT be overly encouraging or use phrases like "great potential" or "wonderful"
- DO NOT end with generic motivational statements
- BE SPECIFIC - reference actual scores and what they mean
- If a score is below 50, treat it as a weakness, not "room for growth"
- If a score is above 85, note it could be too extreme (e.g., 95 extraversion = might talk too much)`;



        const completion = await cerebras.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b',
            max_tokens: 800,
        });

        const choices = completion.choices as Array<{ message?: { content?: string } }>;
        const overview = choices[0]?.message?.content || null;

        return NextResponse.json({ overview });
    } catch (error) {
        console.error('Error generating AI overview:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI overview', overview: null },
            { status: 200 }
        );
    }
}
