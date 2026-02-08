'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Candidate {
    id: string; ext: number; con: number; emo: number; risk: number; dec: number; mot: number; cog: number;
    strengths?: string[]; risk_areas?: string[]; created_at?: string;
}

interface Role {
    id: string; title: string; trait_weights: Record<string, number>;
    ideal_ranges: Record<string, { min: number; max: number }>; minimum_cognitive: number;
}

interface CandidateWithFit extends Candidate {
    fitPercentage: number; rating: 'PROCEED' | 'PROBE' | 'PASS'; ratingColor: 'green' | 'blue' | 'orange';
}

function calculateFit(candidate: Candidate, role: Role): CandidateWithFit {
    const traits: Record<string, number> = { EXT: candidate.ext, CON: candidate.con, EMO: candidate.emo, RISK: candidate.risk, DEC: candidate.dec, MOT: candidate.mot, COG: candidate.cog };
    let fitScore = 0, totalWeight = 0;
    for (const [trait, weight] of Object.entries(role.trait_weights || {})) {
        const candidateScore = traits[trait] || 50;
        const range = role.ideal_ranges?.[trait];
        let traitFit = 100;
        if (range) {
            if (candidateScore < range.min) traitFit = Math.max(0, 100 - (range.min - candidateScore) * 2);
            else if (candidateScore > range.max) traitFit = Math.max(0, 100 - (candidateScore - range.max) * 2);
        }
        fitScore += traitFit * weight; totalWeight += weight;
    }
    const normalizedFit = totalWeight > 0 ? Math.round(fitScore / totalWeight) : 50;
    const behavioralScore = Math.round((candidate.emo * 0.3 + candidate.con * 0.3 + candidate.cog * 0.4));
    const meetsCognitive = candidate.cog >= (role.minimum_cognitive || 50);
    let rating: 'PROCEED' | 'PROBE' | 'PASS', ratingColor: 'green' | 'blue' | 'orange';
    if (normalizedFit >= 75 && behavioralScore >= 65 && meetsCognitive) { rating = 'PROCEED'; ratingColor = 'green'; }
    else if (normalizedFit >= 55 && behavioralScore >= 50) { rating = 'PROBE'; ratingColor = 'blue'; }
    else { rating = 'PASS'; ratingColor = 'orange'; }
    return { ...candidate, fitPercentage: normalizedFit, rating, ratingColor };
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetch('/api/candidates').then((r) => r.json()), fetch('/api/roles').then((r) => r.json())])
            .then(([candidatesData, rolesData]) => {
                if (Array.isArray(candidatesData)) setCandidates(candidatesData);
                if (Array.isArray(rolesData)) { setRoles(rolesData); if (rolesData.length > 0) setSelectedRole(rolesData[0].id); }
            }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const selectedRoleData = roles.find((r) => r.id === selectedRole);
    const candidatesWithFit = selectedRoleData ? candidates.map((c) => calculateFit(c, selectedRoleData)).sort((a, b) => b.fitPercentage - a.fitPercentage) : candidates.map((c) => ({ ...c, fitPercentage: 0, rating: 'PROBE' as const, ratingColor: 'blue' as const }));
    const getBadgeClass = (color: string) => { switch (color) { case 'green': return 'amara-badge-success'; case 'blue': return 'amara-badge-info'; case 'orange': return 'amara-badge-warning'; default: return ''; } };

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="recruiter" showBack backHref="/recruiter" />
            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="flex items-start justify-between mb-8">
                    <div><h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Candidates</h1><p className="text-[var(--text-muted)]">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} assessed</p></div>
                    {roles.length > 0 && (<div className="flex items-center gap-3"><span className="text-sm text-[var(--text-muted)]">Match against:</span><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="amara-input amara-select w-auto">{roles.map((role) => (<option key={role.id} value={role.id}>{role.title}</option>))}</select></div>)}
                </div>

                {loading ? (<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--brand-primary)] border-t-transparent"></div></div>)
                    : candidates.length === 0 ? (<div className="amara-card text-center py-16"><div className="w-16 h-16 rounded-2xl bg-[var(--brand-accent)]/10 flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div><h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">No candidates yet</h2><p className="text-[var(--text-muted)] mb-6">Share the assessment link with candidates to get started</p><Link href="/candidate" className="amara-btn amara-btn-primary">View Assessment</Link></div>)
                        : roles.length === 0 ? (<div className="amara-card text-center py-12 mb-6"><p className="text-[var(--text-muted)] mb-4">Create a role to see candidate matches</p><Link href="/recruiter/roles/new" className="amara-btn amara-btn-primary">Create Role</Link></div>)
                            : (<div className="space-y-4">{candidatesWithFit.map((candidate) => (<div key={candidate.id} className="amara-card"><div className="flex items-start gap-6"><div className="w-16 h-16 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center flex-shrink-0"><span className="text-2xl font-bold text-[var(--text-primary)]">{candidate.fitPercentage}%</span></div><div className="flex-1 min-w-0"><div className="flex items-center gap-3 mb-2"><h2 className="text-lg font-medium text-[var(--text-primary)]">Candidate #{candidate.id.slice(0, 8)}</h2><span className={`amara-badge ${getBadgeClass(candidate.ratingColor)}`}>{candidate.rating}</span></div><div className="grid grid-cols-7 gap-2 mb-3">{[{ label: 'EXT', value: candidate.ext }, { label: 'CON', value: candidate.con }, { label: 'EMO', value: candidate.emo }, { label: 'RISK', value: candidate.risk }, { label: 'DEC', value: candidate.dec }, { label: 'MOT', value: candidate.mot }, { label: 'COG', value: candidate.cog }].map((trait) => (<div key={trait.label} className="text-center"><p className="text-xs text-[var(--text-muted)]">{trait.label}</p><p className="text-sm font-medium text-[var(--text-primary)]">{trait.value}</p></div>))}</div>{candidate.strengths && candidate.strengths.length > 0 && (<p className="text-sm text-[var(--text-muted)] truncate"><span className="text-[var(--status-success)]">+</span> {candidate.strengths[0]}</p>)}{candidate.created_at && (<p className="text-xs text-[var(--text-muted)] mt-2">Assessed {new Date(candidate.created_at).toLocaleDateString()}</p>)}</div></div></div>))}</div>)}
            </main>
        </div>
    );
}
