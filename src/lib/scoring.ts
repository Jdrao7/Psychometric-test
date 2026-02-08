import { Response, TraitScores, WorkValues, WorkStyle, CompositeInsights, RoleFit } from './types';
import behavioralQuestions from './data/questions.json';
import cognitiveQuestions from './data/cognitive.json';
import valuesStyleQuestions from './data/values-style.json';
import roleProfiles from './data/roles.json';

// Trait question mappings
const TRAIT_QUESTIONS: Record<string, number[]> = {
    EXT: [1, 2, 3, 4],
    CON: [5, 6, 7, 8],
    EMO: [9, 10, 11, 12],
    RISK: [13, 14, 15, 16],
    DEC: [17, 18, 19, 20],
    MOT: [21, 22, 23, 24, 25],
};

// Questions that need reverse scoring
const REVERSE_QUESTIONS = [10, 12, 14, 16, 18, 22];

// Cognitive question correct answers
const CORRECT_ANSWERS: Record<number, string> = {
    26: 'B', 27: 'B', 28: 'C', 29: 'B',
    30: 'B', 31: 'B', 32: 'B', 33: 'B'
};

// Get score with reverse scoring applied
function getScore(questionId: number, optionId: string): number {
    const rawValue = parseInt(optionId);
    if (REVERSE_QUESTIONS.includes(questionId)) {
        return 6 - rawValue;
    }
    return rawValue;
}

// Calculate trait scores (0-100)
export function calculateTraitScores(responses: Response[]): TraitScores {
    const rawScores: Record<string, number> = {
        EXT: 0, CON: 0, EMO: 0, RISK: 0, DEC: 0, MOT: 0, COG: 0
    };

    // Calculate behavioral trait scores
    for (const response of responses) {
        const qId = response.questionId;
        if (qId <= 25) {
            for (const [trait, questions] of Object.entries(TRAIT_QUESTIONS)) {
                if (questions.includes(qId)) {
                    rawScores[trait] += getScore(qId, response.optionId);
                }
            }
        }
    }

    // Calculate cognitive score
    let cognitiveCorrect = 0;
    for (const response of responses) {
        if (response.questionId >= 26 && response.questionId <= 33) {
            if (response.optionId === CORRECT_ANSWERS[response.questionId]) {
                cognitiveCorrect++;
            }
        }
    }
    rawScores.COG = cognitiveCorrect;

    // Normalize to 0-100
    const normalized: TraitScores = {
        EXT: normalize(rawScores.EXT, 4),
        CON: normalize(rawScores.CON, 4),
        EMO: normalize(rawScores.EMO, 4),
        RISK: normalize(rawScores.RISK, 4),
        DEC: normalize(rawScores.DEC, 4),
        MOT: normalize(rawScores.MOT, 5),
        COG: Math.round((rawScores.COG / 8) * 100),
    };

    return normalized;
}

function normalize(raw: number, questionCount: number): number {
    const min = questionCount * 1;
    const max = questionCount * 5;
    return Math.round(((raw - min) / (max - min)) * 100);
}

// Extract work values from responses
export function extractWorkValues(responses: Response[]): WorkValues {
    const values: string[] = [];

    for (const response of responses) {
        if (response.questionId >= 34 && response.questionId <= 37) {
            const question = valuesStyleQuestions.find(q => q.id === response.questionId);
            if (question) {
                const option = question.options.find(o => o.id === response.optionId);
                if (option && option.value) {
                    values.push(option.value);
                }
            }
        }
    }

    return {
        primary: values[0] as WorkValues['primary'] || 'autonomy',
        secondary: values[1] || values[0] || 'challenge'
    };
}

// Extract work style from responses
export function extractWorkStyle(responses: Response[]): WorkStyle {
    let teamRole: WorkStyle['teamRole'] = 'Executor';
    let conflictStyle: WorkStyle['conflictStyle'] = 'Collaborating';
    let communicationStyle: WorkStyle['communicationStyle'] = 'Direct';

    for (const response of responses) {
        const question = valuesStyleQuestions.find(q => q.id === response.questionId);
        if (question) {
            const option = question.options.find(o => o.id === response.optionId);
            if (option && option.value) {
                if (question.category === 'teamRole') {
                    teamRole = option.value as WorkStyle['teamRole'];
                } else if (question.category === 'conflictStyle') {
                    conflictStyle = option.value as WorkStyle['conflictStyle'];
                } else if (question.category === 'communicationStyle') {
                    communicationStyle = option.value as WorkStyle['communicationStyle'];
                }
            }
        }
    }

    return { teamRole, conflictStyle, communicationStyle };
}

// Calculate composite insights
export function calculateCompositeInsights(
    traits: TraitScores,
    values: WorkValues
): CompositeInsights {
    // Startup vs Corporate fit
    const startupFit = Math.round(
        traits.RISK * 0.3 +
        traits.DEC * 0.25 +
        traits.MOT * 0.25 +
        (values.primary === 'autonomy' || values.primary === 'challenge' ? 20 : 0)
    );

    const corporateFit = Math.round(
        traits.CON * 0.3 +
        traits.EMO * 0.25 +
        (100 - traits.RISK) * 0.2 +
        (values.primary === 'structure' || values.primary === 'stability' ? 20 : 0)
    );

    // Remote readiness
    const remoteReadiness = Math.round(
        traits.CON * 0.35 +
        traits.EMO * 0.25 +
        (values.primary === 'independence' ? 25 : 0) +
        traits.DEC * 0.15
    );

    // Career path prediction
    const careerPath: CompositeInsights['careerPath'] =
        traits.EXT > 60 && traits.RISK > 55 ? 'Leadership Track' : 'Expert Track';

    // Management style fit
    const managementFit: string[] = [];
    if (traits.CON > 65 && traits.MOT > 60) managementFit.push('hands_off');
    if (traits.EXT > 55 && traits.EMO > 60) managementFit.push('collaborative');
    if (values.primary === 'structure') managementFit.push('directive');
    if (managementFit.length === 0) managementFit.push('collaborative');

    return {
        cultureFit: { startup: startupFit, corporate: corporateFit },
        remoteReadiness,
        careerPath,
        managementFit
    };
}

// Calculate role fit scores
export function calculateRoleFits(
    traits: TraitScores,
    values: WorkValues,
    style: WorkStyle
): RoleFit[] {
    const fits: RoleFit[] = [];

    for (const role of roleProfiles) {
        let fit = 0;

        // Trait alignment (50%)
        let traitFit = 0;
        for (const [trait, weight] of Object.entries(role.weights)) {
            const candidateScore = traits[trait as keyof TraitScores];
            const idealScore = role.ideal[trait as keyof typeof role.ideal];
            const diff = Math.abs(candidateScore - idealScore);
            const traitMatch = Math.max(0, 100 - diff * 1.5);
            traitFit += traitMatch * weight;
        }
        fit += traitFit * 0.5;

        // Values alignment (25%)
        const valueMatch = role.values.includes(values.primary) ? 100 :
            role.values.includes(values.secondary) ? 70 : 40;
        fit += valueMatch * 0.25;

        // Style compatibility (15%)
        const teamRoleMatch = role.style.teamRole.includes(style.teamRole) ? 100 : 50;
        const conflictMatch = role.style.conflictStyle.includes(style.conflictStyle) ? 100 : 50;
        const styleMatch = (teamRoleMatch + conflictMatch) / 2;
        fit += styleMatch * 0.15;

        // Culture match (10%)
        const cultureFit = role.culture === 'mixed' ? 80 : 70;
        fit += cultureFit * 0.10;

        fits.push({
            roleId: role.id,
            title: role.title,
            fitPercentage: Math.round(fit)
        });
    }

    return fits.sort((a, b) => b.fitPercentage - a.fitPercentage);
}

// Generate strengths based on high scores
export function generateStrengths(traits: TraitScores, style: WorkStyle): string[] {
    const strengths: string[] = [];

    if (traits.EXT >= 70) strengths.push('Excellent at building relationships and influencing others');
    if (traits.EXT >= 60) strengths.push('Comfortable in collaborative environments');

    if (traits.CON >= 70) strengths.push('Highly reliable and detail-oriented');
    if (traits.CON >= 60) strengths.push('Consistent follow-through on commitments');

    if (traits.EMO >= 70) strengths.push('Exceptional composure under pressure');
    if (traits.EMO >= 60) strengths.push('Recovers quickly from setbacks');

    if (traits.RISK >= 70) strengths.push('Thrives in uncertain, fast-changing environments');
    if (traits.RISK >= 60) strengths.push('Comfortable making bold decisions');

    if (traits.DEC >= 70) strengths.push('Quick decision-maker who adapts on the fly');
    if (traits.DEC >= 60) strengths.push('Decisive under time pressure');

    if (traits.MOT >= 70) strengths.push('Highly growth-oriented and ambitious');
    if (traits.MOT >= 60) strengths.push('Actively seeks learning opportunities');

    if (traits.COG >= 80) strengths.push('Exceptional problem-solving and analytical skills');
    if (traits.COG >= 65) strengths.push('Strong critical thinking abilities');

    if (style.teamRole === 'Leader') strengths.push('Natural leadership instincts');
    if (style.teamRole === 'Innovator') strengths.push('Creative problem-solver');
    if (style.conflictStyle === 'Collaborating') strengths.push('Skilled at finding win-win solutions');

    return strengths.slice(0, 5); // Top 5 strengths
}

// Generate risk areas based on low scores or extreme scores
export function generateRiskAreas(traits: TraitScores, values: WorkValues): string[] {
    const risks: string[] = [];

    if (traits.EXT <= 35) risks.push('May find highly social roles draining');
    if (traits.EXT >= 80) risks.push('May struggle in isolated, independent work');

    if (traits.CON <= 35) risks.push('May need support with detailed planning');
    if (traits.CON >= 85) risks.push('May be inflexible when plans change');

    if (traits.EMO <= 40) risks.push('High-pressure environments may be challenging');

    if (traits.RISK <= 30) risks.push('May hesitate on decisions with uncertainty');
    if (traits.RISK >= 80) risks.push('May take unnecessary risks without analysis');

    if (traits.DEC >= 80) risks.push('May make decisions too quickly without data');
    if (traits.DEC <= 30) risks.push('Analysis paralysis in time-sensitive situations');

    if (traits.MOT <= 40) risks.push('May prefer stability over growth opportunities');

    if (values.primary === 'autonomy') risks.push('May resist micromanagement or rigid structures');
    if (values.primary === 'stability') risks.push('May be uncomfortable with rapid change');

    return risks.slice(0, 4); // Top 4 risks
}

// Calculate response consistency
export function calculateConsistency(responses: Response[]): number {
    // Check reverse-scored pairs for consistency
    const pairs = [[9, 10], [13, 14], [17, 18]];
    let consistent = 0;

    for (const [q1, q2] of pairs) {
        const r1 = responses.find(r => r.questionId === q1);
        const r2 = responses.find(r => r.questionId === q2);

        if (r1 && r2) {
            const v1 = parseInt(r1.optionId);
            const v2 = parseInt(r2.optionId);
            // For a reverse pair, sum should be around 6 if consistent
            const sum = v1 + v2;
            if (sum >= 4 && sum <= 8) consistent++;
        }
    }

    return Math.round((consistent / pairs.length) * 100);
}

// Calculate average response time
export function calculateAvgResponseTime(responses: Response[]): number {
    if (responses.length === 0) return 0;
    const totalTime = responses.reduce((sum, r) => sum + r.responseTime, 0);
    return Math.round((totalTime / responses.length) / 1000 * 10) / 10; // seconds
}

// Get all questions in order
export function getAllQuestions() {
    return [
        ...behavioralQuestions,
        ...cognitiveQuestions,
        ...valuesStyleQuestions
    ];
}
