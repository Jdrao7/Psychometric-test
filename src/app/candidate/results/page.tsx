'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { AssessmentResult, RoleFit, TraitScores, WorkValues, WorkStyle } from '@/lib/types';
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const TRAIT_LABELS: Record<string, string> = {
    EXT: 'Extraversion', CON: 'Conscientiousness', EMO: 'Emotional Stability',
    RISK: 'Risk Tolerance', DEC: 'Decision Speed', MOT: 'Motivation', COG: 'Cognitive',
};

interface CustomRole {
    id: string; title: string; trait_weights: Record<string, number>;
    ideal_ranges: Record<string, { min: number; max: number }>; minimum_cognitive: number;
}

interface CustomRoleFit extends RoleFit {
    ratingColor: 'green' | 'blue' | 'orange'; ratingLabel: 'PROCEED' | 'PROBE' | 'PASS';
}

function calculateCustomRoleFit(traits: TraitScores, values: WorkValues, style: WorkStyle, role: CustomRole): CustomRoleFit {
    let fitScore = 0, totalWeight = 0;
    for (const [trait, weight] of Object.entries(role.trait_weights)) {
        const candidateScore = traits[trait as keyof TraitScores] || 50;
        const range = role.ideal_ranges[trait];
        let traitFit = 100;
        if (range) {
            if (candidateScore < range.min) traitFit = Math.max(0, 100 - (range.min - candidateScore) * 2);
            else if (candidateScore > range.max) traitFit = Math.max(0, 100 - (candidateScore - range.max) * 2);
        }
        fitScore += traitFit * weight; totalWeight += weight;
    }
    const normalizedFit = totalWeight > 0 ? Math.round(fitScore / totalWeight) : 50;
    const behavioralScore = Math.round((traits.EMO * 0.3 + traits.CON * 0.3 + traits.COG * 0.4));
    const meetsCognitive = traits.COG >= (role.minimum_cognitive || 50);
    let ratingColor: 'green' | 'blue' | 'orange', ratingLabel: 'PROCEED' | 'PROBE' | 'PASS';
    if (normalizedFit >= 75 && behavioralScore >= 65 && meetsCognitive) { ratingColor = 'green'; ratingLabel = 'PROCEED'; }
    else if (normalizedFit >= 55 && behavioralScore >= 50) { ratingColor = 'blue'; ratingLabel = 'PROBE'; }
    else { ratingColor = 'orange'; ratingLabel = 'PASS'; }
    return { roleId: role.id, title: role.title, fitPercentage: normalizedFit, ratingColor, ratingLabel };
}

export default function CandidateResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [aiOverview, setAiOverview] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [customRoleFits, setCustomRoleFits] = useState<CustomRoleFit[]>([]);
    const [loadingCustomRoles, setLoadingCustomRoles] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('assessmentResult');
        if (stored) {
            const parsedResult = JSON.parse(stored) as AssessmentResult;
            setResult(parsedResult);
            setAiLoading(true);
            fetch('/api/ai-overview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsedResult) })
                .then((res) => res.json()).then((data) => { if (data.overview) setAiOverview(data.overview); })
                .catch((err) => console.error('AI overview error:', err)).finally(() => setAiLoading(false));
            fetch('/api/roles').then((res) => res.json()).then((roles: CustomRole[]) => {
                if (Array.isArray(roles) && roles.length > 0) {
                    const fits = roles.map((role) => calculateCustomRoleFit(parsedResult.traits, parsedResult.workValues, parsedResult.workStyle, role));
                    fits.sort((a, b) => b.fitPercentage - a.fitPercentage); setCustomRoleFits(fits);
                }
            }).catch((err) => console.error('Error fetching custom roles:', err)).finally(() => setLoadingCustomRoles(false));
        } else { router.push('/candidate'); }
    }, [router]);

    const getBadgeClass = (color: string) => {
        switch (color) { case 'green': return 'amara-badge-success'; case 'blue': return 'amara-badge-info'; case 'orange': return 'amara-badge-warning'; default: return ''; }
    };

    if (!result) {
        return (<div className="min-h-screen surface-gradient flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--brand-primary)] border-t-transparent"></div></div>);
    }

    const radarData = {
        labels: Object.keys(result.traits).map((k) => TRAIT_LABELS[k]),
        datasets: [{ label: 'Your Profile', data: Object.values(result.traits), backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: 'rgba(79, 70, 229, 1)', borderWidth: 2, pointBackgroundColor: 'rgba(79, 70, 229, 1)' }],
    };
    const radarOptions = { scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, color: '#64748B', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#CBD5E1', font: { size: 11 } } } }, plugins: { legend: { display: false } } };
    const displayRoleFits = customRoleFits.length > 0 ? customRoleFits : result.roleFits;
    const barData = {
        labels: displayRoleFits.slice(0, 4).map((r) => r.title),
        datasets: [{
            label: 'Fit %', data: displayRoleFits.slice(0, 4).map((r) => r.fitPercentage),
            backgroundColor: customRoleFits.length > 0 ? displayRoleFits.slice(0, 4).map((r) => { const fit = r as CustomRoleFit; switch (fit.ratingColor) { case 'green': return 'rgba(16, 185, 129, 0.8)'; case 'blue': return 'rgba(59, 130, 246, 0.8)'; case 'orange': return 'rgba(245, 158, 11, 0.8)'; default: return 'rgba(79, 70, 229, 0.8)'; } }) : ['rgba(79, 70, 229, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'], borderRadius: 6
        }],
    };
    const barOptions = { indexAxis: 'y' as const, scales: { x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#64748B' } }, y: { grid: { display: false }, ticks: { color: '#CBD5E1' } } }, plugins: { legend: { display: false } } };

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="candidate" showBack backHref="/candidate" />
            <main className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Your Assessment Results</h1>
                    <p className="text-[var(--text-muted)]">Here&apos;s what we learned about your professional profile</p>
                </div>

                <div className="amara-card mb-8 border-[var(--brand-primary)]/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <div><h2 className="text-lg font-medium text-[var(--text-primary)]">AI Coach Insights</h2><p className="text-sm text-[var(--text-muted)]">Personalized career guidance</p></div>
                    </div>
                    {aiLoading ? (<div className="flex items-center gap-3 text-[var(--text-muted)]"><div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--brand-primary)] border-t-transparent"></div><span>Generating insights...</span></div>) : aiOverview ? (<div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{aiOverview}</div>) : (<p className="text-[var(--text-muted)] italic">AI insights unavailable. Configure CEREBRAS_API_KEY to enable.</p>)}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="amara-card"><h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Trait Profile</h2><div className="aspect-square max-w-sm mx-auto"><Radar data={radarData} options={radarOptions} /></div></div>
                    <div className="amara-card"><h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">Role Matches</h2><p className="text-sm text-[var(--text-muted)] mb-6">{customRoleFits.length > 0 ? `${customRoleFits.length} role(s) from recruiters` : 'Default role profiles'}</p>{loadingCustomRoles ? (<div className="flex items-center gap-2 text-[var(--text-muted)]"><div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--brand-primary)] border-t-transparent"></div>Loading roles...</div>) : (<div className="h-56"><Bar data={barData} options={barOptions} /></div>)}</div>
                </div>

                {customRoleFits.length > 0 && (<div className="amara-card mb-8"><h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">All Role Matches</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{customRoleFits.map((fit) => (<div key={fit.roleId} className="bg-[var(--surface-elevated)] rounded-xl p-4 border border-white/5"><div className="flex items-center justify-between mb-2"><h3 className="text-[var(--text-primary)] font-medium">{fit.title}</h3><span className={`amara-badge ${getBadgeClass(fit.ratingColor)}`}>{fit.ratingLabel}</span></div><p className="text-2xl font-bold text-[var(--text-primary)]">{fit.fitPercentage}%</p></div>))}</div></div>)}

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="amara-card"><h2 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2"><span className="text-[var(--status-success)]">✓</span> Strengths</h2><ul className="space-y-2">{result.strengths.map((s, i) => (<li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]"><span className="text-[var(--status-success)]">•</span>{s}</li>))}</ul></div>
                    <div className="amara-card"><h2 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2"><span className="text-[var(--status-warning)]">⚠</span> Areas to Watch</h2><ul className="space-y-2">{result.riskAreas.map((r, i) => (<li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]"><span className="text-[var(--status-warning)]">•</span>{r}</li>))}</ul></div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => { localStorage.removeItem('assessmentResult'); router.push('/candidate'); }} className="amara-btn amara-btn-ghost">Retake Assessment</button>
                    <Link href="/" className="amara-btn amara-btn-primary">Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
