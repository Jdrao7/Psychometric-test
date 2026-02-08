'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Components
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

// Utilities
import { CustomRole, RoleFitResult, toTraitScores, calculateRoleFit, CandidateTraits } from '@/lib/role-matching';
import { getBadgeClass, TRAIT_IDS } from '@/lib/constants';

// Types
interface Candidate extends CandidateTraits {
    id: string;
    strengths?: string[];
    risk_areas?: string[];
    created_at?: string;
}

interface CandidateWithFit extends Candidate {
    fitPercentage: number;
    rating: RoleFitResult['rating'];
    ratingColor: RoleFitResult['ratingColor'];
}

/**
 * Calculate role fit for a candidate
 */
function calculateCandidateFit(candidate: Candidate, role: CustomRole): CandidateWithFit {
    const traits = toTraitScores(candidate);
    const result = calculateRoleFit(traits, role);

    return {
        ...candidate,
        fitPercentage: result.fitPercentage,
        rating: result.rating,
        ratingColor: result.ratingColor,
    };
}

export default function CandidatesPage() {
    // State
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [roles, setRoles] = useState<CustomRole[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        Promise.all([
            fetch('/api/candidates').then(r => r.json()),
            fetch('/api/roles').then(r => r.json()),
        ])
            .then(([candidatesData, rolesData]) => {
                if (Array.isArray(candidatesData)) {
                    setCandidates(candidatesData);
                }
                if (Array.isArray(rolesData) && rolesData.length > 0) {
                    setRoles(rolesData);
                    setSelectedRoleId(rolesData[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Get selected role and calculate fits
    const selectedRole = roles.find(r => r.id === selectedRoleId);

    const candidatesWithFit: CandidateWithFit[] = selectedRole
        ? candidates
            .map(c => calculateCandidateFit(c, selectedRole))
            .sort((a, b) => b.fitPercentage - a.fitPercentage)
        : candidates.map(c => ({
            ...c,
            fitPercentage: 0,
            rating: 'PROBE' as const,
            ratingColor: 'blue' as const,
        }));

    // Trait display config
    const traitItems = [
        { key: 'ext', label: 'EXT' },
        { key: 'con', label: 'CON' },
        { key: 'emo', label: 'EMO' },
        { key: 'risk', label: 'RISK' },
        { key: 'dec', label: 'DEC' },
        { key: 'mot', label: 'MOT' },
        { key: 'cog', label: 'COG' },
    ] as const;

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="recruiter" showBack backHref="/recruiter" />

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                {/* Page Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                            Candidates
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} assessed
                        </p>
                    </div>

                    {/* Role Selector */}
                    {roles.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[var(--text-muted)]">Match against:</span>
                            <select
                                value={selectedRoleId}
                                onChange={e => setSelectedRoleId(e.target.value)}
                                className="amara-input amara-select w-auto"
                            >
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : candidates.length === 0 ? (
                    <EmptyState type="no-candidates" />
                ) : roles.length === 0 ? (
                    <EmptyState type="no-roles" />
                ) : (
                    <div className="space-y-4">
                        {candidatesWithFit.map(candidate => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                traitItems={traitItems}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Sub-components for cleaner code

interface EmptyStateProps {
    type: 'no-candidates' | 'no-roles';
}

function EmptyState({ type }: EmptyStateProps) {
    if (type === 'no-candidates') {
        return (
            <div className="amara-card text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand-accent)]/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                    No candidates yet
                </h2>
                <p className="text-[var(--text-muted)] mb-6">
                    Share the assessment link with candidates to get started
                </p>
                <Link href="/candidate" className="amara-btn amara-btn-primary">
                    View Assessment
                </Link>
            </div>
        );
    }

    return (
        <div className="amara-card text-center py-12 mb-6">
            <p className="text-[var(--text-muted)] mb-4">
                Create a role to see candidate matches
            </p>
            <Link href="/recruiter/roles/new" className="amara-btn amara-btn-primary">
                Create Role
            </Link>
        </div>
    );
}

interface CandidateCardProps {
    candidate: CandidateWithFit;
    traitItems: readonly { key: keyof CandidateTraits; label: string }[];
}

function CandidateCard({ candidate, traitItems }: CandidateCardProps) {
    return (
        <div className="amara-card">
            <div className="flex items-start gap-6">
                {/* Fit Score */}
                <div className="w-16 h-16 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                        {candidate.fitPercentage}%
                    </span>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-medium text-[var(--text-primary)]">
                            Candidate #{candidate.id.slice(0, 8)}
                        </h2>
                        <span className={`amara-badge ${getBadgeClass(candidate.ratingColor)}`}>
                            {candidate.rating}
                        </span>
                    </div>

                    {/* Trait Scores */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {traitItems.map(trait => (
                            <div key={trait.label} className="text-center">
                                <p className="text-xs text-[var(--text-muted)]">{trait.label}</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    {candidate[trait.key]}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Strength Preview */}
                    {candidate.strengths && candidate.strengths.length > 0 && (
                        <p className="text-sm text-[var(--text-muted)] truncate">
                            <span className="text-[var(--status-success)]">+</span> {candidate.strengths[0]}
                        </p>
                    )}

                    {/* Date */}
                    {candidate.created_at && (
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                            Assessed {new Date(candidate.created_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
