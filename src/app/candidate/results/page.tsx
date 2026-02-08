'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

// Components
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import RoleFitCard from '@/components/RoleFitCard';

// Utilities
import { AssessmentResult } from '@/lib/types';
import { CustomRole, RoleFitResult, calculateAllRoleFits } from '@/lib/role-matching';
import { getBadgeClass } from '@/lib/constants';
import { radarOptions, barOptions, getRadarData, getBarData, getDefaultBarData } from '@/lib/chart-config';

// Register Chart.js components
ChartJS.register(
    RadialLinearScale, PointElement, LineElement, Filler,
    Tooltip, Legend, CategoryScale, LinearScale, BarElement
);

export default function CandidateResultsPage() {
    const router = useRouter();

    // State
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [aiOverview, setAiOverview] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [customRoleFits, setCustomRoleFits] = useState<RoleFitResult[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // Load assessment result and fetch data
    useEffect(() => {
        const stored = localStorage.getItem('assessmentResult');

        if (!stored) {
            router.push('/candidate');
            return;
        }

        const parsedResult = JSON.parse(stored) as AssessmentResult;
        setResult(parsedResult);

        // Fetch AI insights
        setAiLoading(true);
        fetch('/api/ai-overview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedResult),
        })
            .then(res => res.json())
            .then(data => {
                if (data.overview) setAiOverview(data.overview);
            })
            .catch(err => console.error('AI overview error:', err))
            .finally(() => setAiLoading(false));

        // Fetch custom roles and calculate fits
        fetch('/api/roles')
            .then(res => res.json())
            .then((roles: CustomRole[]) => {
                if (Array.isArray(roles) && roles.length > 0) {
                    const fits = calculateAllRoleFits(parsedResult.traits, roles);
                    setCustomRoleFits(fits);
                }
            })
            .catch(err => console.error('Error fetching roles:', err))
            .finally(() => setLoadingRoles(false));
    }, [router]);

    // Loading state
    if (!result) {
        return <LoadingSpinner fullScreen />;
    }

    // Chart data
    const radarData = getRadarData(result.traits);
    const displayRoleFits = customRoleFits.length > 0 ? customRoleFits : result.roleFits;
    const barData = customRoleFits.length > 0
        ? getBarData(customRoleFits)
        : getDefaultBarData(result.roleFits);

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="candidate" showBack backHref="/candidate" />

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Your Assessment Results
                    </h1>
                    <p className="text-[var(--text-muted)]">
                        Here&apos;s what we learned about your professional profile
                    </p>
                </div>

                {/* AI Insights Card */}
                <div className="amara-card mb-8 border-[var(--brand-primary)]/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-[var(--text-primary)]">AI Coach Insights</h2>
                            <p className="text-sm text-[var(--text-muted)]">Personalized career guidance</p>
                        </div>
                    </div>

                    {aiLoading ? (
                        <LoadingSpinner size="sm" text="Generating insights..." />
                    ) : aiOverview ? (
                        <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {aiOverview}
                        </div>
                    ) : (
                        <p className="text-[var(--text-muted)] italic">
                            AI insights unavailable. Configure CEREBRAS_API_KEY to enable.
                        </p>
                    )}
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Radar Chart */}
                    <div className="amara-card">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">
                            Trait Profile
                        </h2>
                        <div className="aspect-square max-w-sm mx-auto">
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="amara-card">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                            Role Matches
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6">
                            {customRoleFits.length > 0
                                ? `${customRoleFits.length} role(s) from recruiters`
                                : 'Default role profiles'}
                        </p>
                        {loadingRoles ? (
                            <LoadingSpinner size="sm" text="Loading roles..." />
                        ) : (
                            <div className="h-56">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        )}
                    </div>
                </div>

                {/* All Role Matches */}
                {customRoleFits.length > 0 && (
                    <div className="amara-card mb-8">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                            All Role Matches
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customRoleFits.map(fit => (
                                <RoleFitCard key={fit.roleId} fit={fit} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Strengths & Risk Areas */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Strengths */}
                    <div className="amara-card">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <span className="text-[var(--status-success)]">✓</span> Strengths
                        </h2>
                        <ul className="space-y-2">
                            {result.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]">
                                    <span className="text-[var(--status-success)]">•</span>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Areas to Watch */}
                    <div className="amara-card">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <span className="text-[var(--status-warning)]">⚠</span> Areas to Watch
                        </h2>
                        <ul className="space-y-2">
                            {result.riskAreas.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]">
                                    <span className="text-[var(--status-warning)]">•</span>
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('assessmentResult');
                            router.push('/candidate');
                        }}
                        className="amara-btn amara-btn-ghost"
                    >
                        Retake Assessment
                    </button>
                    <Link href="/" className="amara-btn amara-btn-primary">
                        Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
