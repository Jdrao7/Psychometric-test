/**
 * Chart.js configuration helpers for consistent chart styling
 */

import { TRAIT_LABELS, CHART_COLORS } from './constants';
import { TraitScores } from './types';
import { RoleFitResult } from './role-matching';

// Radar chart options for trait profiles
export const radarOptions = {
    scales: {
        r: {
            beginAtZero: true,
            max: 100,
            ticks: {
                stepSize: 25,
                color: '#64748B',
                backdropColor: 'transparent',
            },
            grid: {
                color: 'rgba(255,255,255,0.06)',
            },
            pointLabels: {
                color: '#CBD5E1',
                font: { size: 11 },
            },
        },
    },
    plugins: {
        legend: { display: false },
    },
};

// Horizontal bar chart options for role fits
export const barOptions = {
    indexAxis: 'y' as const,
    scales: {
        x: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#64748B' },
        },
        y: {
            grid: { display: false },
            ticks: { color: '#CBD5E1' },
        },
    },
    plugins: {
        legend: { display: false },
    },
};

/**
 * Generate radar chart data from trait scores
 */
export function getRadarData(traits: TraitScores, label = 'Your Profile') {
    return {
        labels: Object.keys(traits).map(k => TRAIT_LABELS[k] || k),
        datasets: [{
            label,
            data: Object.values(traits),
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        }],
    };
}

/**
 * Get bar color based on rating
 */
function getBarColor(result: RoleFitResult): string {
    switch (result.ratingColor) {
        case 'green': return CHART_COLORS.success;
        case 'blue': return CHART_COLORS.info;
        case 'orange': return CHART_COLORS.warning;
        default: return CHART_COLORS.primary;
    }
}

/**
 * Generate bar chart data from role fit results
 */
export function getBarData(roleFits: RoleFitResult[], maxRoles = 4) {
    const displayed = roleFits.slice(0, maxRoles);

    return {
        labels: displayed.map(r => r.title),
        datasets: [{
            label: 'Fit %',
            data: displayed.map(r => r.fitPercentage),
            backgroundColor: displayed.map(r => getBarColor(r)),
            borderRadius: 6,
        }],
    };
}

/**
 * Generate default bar chart data (when no custom roles)
 */
export function getDefaultBarData(
    roleFits: Array<{ title: string; fitPercentage: number }>,
    maxRoles = 4
) {
    const displayed = roleFits.slice(0, maxRoles);
    const defaultColors = [
        CHART_COLORS.primary,
        CHART_COLORS.accent,
        CHART_COLORS.info,
        CHART_COLORS.success,
    ];

    return {
        labels: displayed.map(r => r.title),
        datasets: [{
            label: 'Fit %',
            data: displayed.map(r => r.fitPercentage),
            backgroundColor: defaultColors.slice(0, displayed.length),
            borderRadius: 6,
        }],
    };
}
