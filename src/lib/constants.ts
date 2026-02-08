/**
 * Shared constants used across the application
 */

// Trait ID to human-readable label mapping
export const TRAIT_LABELS: Record<string, string> = {
    EXT: 'Extraversion',
    CON: 'Conscientiousness',
    EMO: 'Emotional Stability',
    RISK: 'Risk Tolerance',
    DEC: 'Decision Speed',
    MOT: 'Motivation',
    COG: 'Cognitive',
};

// Ordered list of trait IDs
export const TRAIT_IDS = ['EXT', 'CON', 'EMO', 'RISK', 'DEC', 'MOT', 'COG'] as const;

// Chart color palette
export const CHART_COLORS = {
    primary: 'rgba(79, 70, 229, 0.8)',
    accent: 'rgba(249, 115, 22, 0.8)',
    success: 'rgba(16, 185, 129, 0.8)',
    info: 'rgba(59, 130, 246, 0.8)',
    warning: 'rgba(245, 158, 11, 0.8)',
};

// Rating color to badge class mapping
export function getBadgeClass(color: 'green' | 'blue' | 'orange' | string): string {
    switch (color) {
        case 'green': return 'amara-badge-success';
        case 'blue': return 'amara-badge-info';
        case 'orange': return 'amara-badge-warning';
        default: return '';
    }
}
