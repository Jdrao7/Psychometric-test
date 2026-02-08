/**
 * Role matching logic - calculates how well a candidate fits a role
 */

import { TraitScores } from './types';

// Custom role from database
export interface CustomRole {
    id: string;
    title: string;
    trait_weights: Record<string, number>;
    ideal_ranges: Record<string, { min: number; max: number }>;
    minimum_cognitive: number;
}

// Rating types
export type RatingLabel = 'PROCEED' | 'PROBE' | 'PASS';
export type RatingColor = 'green' | 'blue' | 'orange';

// Result of role fit calculation
export interface RoleFitResult {
    roleId: string;
    title: string;
    fitPercentage: number;
    rating: RatingLabel;
    ratingColor: RatingColor;
}

// Candidate trait data (from database format)
export interface CandidateTraits {
    ext: number;
    con: number;
    emo: number;
    risk: number;
    dec: number;
    mot: number;
    cog: number;
}

/**
 * Convert database candidate format to TraitScores format
 */
export function toTraitScores(candidate: CandidateTraits): TraitScores {
    return {
        EXT: candidate.ext,
        CON: candidate.con,
        EMO: candidate.emo,
        RISK: candidate.risk,
        DEC: candidate.dec,
        MOT: candidate.mot,
        COG: candidate.cog,
    };
}

/**
 * Calculate how well a trait score fits within the ideal range
 * Returns 0-100 where 100 is perfect fit
 */
function calculateTraitFit(score: number, range?: { min: number; max: number }): number {
    if (!range) return 100;

    if (score < range.min) {
        return Math.max(0, 100 - (range.min - score) * 2);
    }
    if (score > range.max) {
        return Math.max(0, 100 - (score - range.max) * 2);
    }
    return 100; // Within range
}

/**
 * Determine rating based on fit percentage and behavioral score
 */
function getRating(
    fitPercentage: number,
    behavioralScore: number,
    meetsCognitive: boolean
): { rating: RatingLabel; ratingColor: RatingColor } {
    if (fitPercentage >= 75 && behavioralScore >= 65 && meetsCognitive) {
        return { rating: 'PROCEED', ratingColor: 'green' };
    }
    if (fitPercentage >= 55 && behavioralScore >= 50) {
        return { rating: 'PROBE', ratingColor: 'blue' };
    }
    return { rating: 'PASS', ratingColor: 'orange' };
}

/**
 * Calculate role fit for a candidate against a custom role
 */
export function calculateRoleFit(traits: TraitScores, role: CustomRole): RoleFitResult {
    // Calculate weighted trait fit
    let fitScore = 0;
    let totalWeight = 0;

    for (const [trait, weight] of Object.entries(role.trait_weights || {})) {
        const candidateScore = traits[trait as keyof TraitScores] || 50;
        const range = role.ideal_ranges?.[trait];
        const traitFit = calculateTraitFit(candidateScore, range);

        fitScore += traitFit * weight;
        totalWeight += weight;
    }

    const normalizedFit = totalWeight > 0 ? Math.round(fitScore / totalWeight) : 50;

    // Calculate behavioral score (weighted combination)
    const behavioralScore = Math.round(
        traits.EMO * 0.3 + traits.CON * 0.3 + traits.COG * 0.4
    );

    // Check cognitive minimum
    const meetsCognitive = traits.COG >= (role.minimum_cognitive || 50);

    // Get rating
    const { rating, ratingColor } = getRating(normalizedFit, behavioralScore, meetsCognitive);

    return {
        roleId: role.id,
        title: role.title,
        fitPercentage: normalizedFit,
        rating,
        ratingColor,
    };
}

/**
 * Calculate role fits for a candidate against multiple roles, sorted by fit
 */
export function calculateAllRoleFits(traits: TraitScores, roles: CustomRole[]): RoleFitResult[] {
    return roles
        .map(role => calculateRoleFit(traits, role))
        .sort((a, b) => b.fitPercentage - a.fitPercentage);
}
