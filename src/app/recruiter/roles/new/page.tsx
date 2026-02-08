'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

const TRAITS = [
    { id: 'EXT', name: 'Extraversion', description: 'Social energy, assertiveness' },
    { id: 'CON', name: 'Conscientiousness', description: 'Organization, reliability' },
    { id: 'EMO', name: 'Emotional Stability', description: 'Stress handling, composure' },
    { id: 'RISK', name: 'Risk Tolerance', description: 'Comfort with uncertainty' },
    { id: 'DEC', name: 'Decision Speed', description: 'Quick vs deliberate decisions' },
    { id: 'MOT', name: 'Motivation', description: 'Drive and ambition' },
    { id: 'COG', name: 'Cognitive Ability', description: 'Problem-solving, critical thinking' },
];

interface TraitConfig { weight: number; min: number; max: number; }

export default function CreateRolePage() {
    const router = useRouter();
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [culture, setCulture] = useState<'startup' | 'corporate' | 'hybrid'>('hybrid');
    const [minCognitive, setMinCognitive] = useState(50);
    const [traits, setTraits] = useState<Record<string, TraitConfig>>({
        EXT: { weight: 1, min: 40, max: 80 }, CON: { weight: 1, min: 50, max: 90 },
        EMO: { weight: 1, min: 50, max: 90 }, RISK: { weight: 1, min: 30, max: 70 },
        DEC: { weight: 1, min: 40, max: 80 }, MOT: { weight: 1, min: 50, max: 95 },
        COG: { weight: 1, min: 50, max: 100 },
    });
    const [saving, setSaving] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/roles/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: aiPrompt }) });
            const data = await res.json();
            if (data.role) {
                setTitle(data.role.title || ''); setDescription(data.role.description || '');
                setCulture(data.role.culture || 'hybrid'); setMinCognitive(data.role.minimumCognitive || 50);
                if (data.role.traits) setTraits(data.role.traits);
                setMode('manual');
            }
        } catch (error) { console.error('AI generation error:', error); }
        finally { setAiLoading(false); }
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/roles', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, description,
                    traitWeights: Object.fromEntries(Object.entries(traits).map(([k, v]) => [k, v.weight])),
                    idealRanges: Object.fromEntries(Object.entries(traits).map(([k, v]) => [k, { min: v.min, max: v.max }])),
                    culturePreference: culture, minimumCognitive: minCognitive, isAiGenerated: mode === 'ai',
                }),
            });
            if (res.ok) router.push('/recruiter/roles');
        } catch (error) { console.error('Save error:', error); }
        finally { setSaving(false); }
    };

    const updateTrait = (traitId: string, field: keyof TraitConfig, value: number) => {
        setTraits((prev) => ({ ...prev, [traitId]: { ...prev[traitId], [field]: value } }));
    };

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="recruiter" showBack backHref="/recruiter" />
            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <div className="mb-8"><h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Create Role</h1><p className="text-[var(--text-muted)]">Define trait requirements for candidate matching</p></div>

                <div className="flex gap-2 mb-8 p-1 bg-[var(--surface-card)] rounded-xl w-fit">
                    <button onClick={() => setMode('ai')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'ai' ? 'bg-[var(--brand-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>AI-Assisted</button>
                    <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-[var(--brand-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>Manual Setup</button>
                </div>

                {mode === 'ai' && (
                    <div className="amara-card mb-8 border-[var(--brand-primary)]/20">
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">Describe the Role</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-4">Tell us about the ideal candidate and we&apos;ll generate trait requirements</p>
                        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Example: I need a senior sales executive who can handle rejection, close deals independently..." className="amara-input h-28 resize-none mb-4" />
                        <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()} className="amara-btn amara-btn-primary">
                            {aiLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Generating...</>) : 'Generate Criteria'}
                        </button>
                    </div>
                )}

                {(mode === 'manual' || title) && (
                    <div className="space-y-6">
                        <div className="amara-card">
                            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div><label className="block text-sm text-[var(--text-muted)] mb-2">Role Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior Sales Executive" className="amara-input" /></div>
                                <div><label className="block text-sm text-[var(--text-muted)] mb-2">Description (optional)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the role..." className="amara-input h-20 resize-none" /></div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Culture Preference</label><select value={culture} onChange={(e) => setCulture(e.target.value as 'startup' | 'corporate' | 'hybrid')} className="amara-input amara-select"><option value="startup">Startup</option><option value="corporate">Corporate</option><option value="hybrid">Hybrid</option></select></div>
                                    <div><label className="block text-sm text-[var(--text-muted)] mb-2">Minimum Cognitive Score</label><input type="number" min="0" max="100" value={minCognitive} onChange={(e) => setMinCognitive(Number(e.target.value))} className="amara-input" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="amara-card">
                            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">Trait Requirements</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Set weight and ideal score range for each trait</p>
                            <div className="space-y-4">
                                {TRAITS.map((trait) => (
                                    <div key={trait.id} className="bg-[var(--surface-elevated)] rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div><h3 className="text-[var(--text-primary)] font-medium">{trait.name}</h3><p className="text-xs text-[var(--text-muted)]">{trait.description}</p></div>
                                            <select value={String(traits[trait.id].weight)} onChange={(e) => updateTrait(trait.id, 'weight', parseFloat(e.target.value))} className="amara-input amara-select w-auto text-sm py-1.5 px-3"><option value="0.5">Low</option><option value="1">Normal</option><option value="1.5">High</option><option value="2">Critical</option></select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs text-[var(--text-muted)]">Min: {traits[trait.id].min}</label><input type="range" min="0" max="100" value={traits[trait.id].min} onChange={(e) => updateTrait(trait.id, 'min', Number(e.target.value))} className="amara-range w-full mt-1" /></div>
                                            <div><label className="text-xs text-[var(--text-muted)]">Max: {traits[trait.id].max}</label><input type="range" min="0" max="100" value={traits[trait.id].max} onChange={(e) => updateTrait(trait.id, 'max', Number(e.target.value))} className="amara-range w-full mt-1" /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href="/recruiter" className="amara-btn amara-btn-ghost">Cancel</Link>
                            <button onClick={handleSave} disabled={saving || !title.trim()} className="amara-btn amara-btn-primary">{saving ? 'Saving...' : 'Save Role'}</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
