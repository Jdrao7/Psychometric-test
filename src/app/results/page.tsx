'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentResult } from '@/lib/types';
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

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

const TRAIT_LABELS: Record<string, string> = {
    EXT: 'Extraversion',
    CON: 'Conscientiousness',
    EMO: 'Emotional Stability',
    RISK: 'Risk Tolerance',
    DEC: 'Decision Speed',
    MOT: 'Motivation',
    COG: 'Cognitive Ability',
};

export default function ResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [aiOverview, setAiOverview] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('assessmentResult');
        if (stored) {
            const parsedResult = JSON.parse(stored);
            setResult(parsedResult);

            // Fetch AI overview
            setAiLoading(true);
            fetch('/api/ai-overview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedResult),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.overview) {
                        setAiOverview(data.overview);
                    }
                })
                .catch((err) => console.error('AI overview error:', err))
                .finally(() => setAiLoading(false));
        } else {
            router.push('/');
        }
    }, [router]);

    if (!result) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading results...</div>
            </main>
        );
    }

    const radarData = {
        labels: Object.keys(result.traits).map((k) => TRAIT_LABELS[k]),
        datasets: [
            {
                label: 'Your Profile',
                data: Object.values(result.traits),
                backgroundColor: 'rgba(168, 85, 247, 0.3)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(168, 85, 247, 1)',
            },
        ],
    };

    const radarOptions = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20, color: '#9ca3af' },
                grid: { color: 'rgba(255,255,255,0.1)' },
                pointLabels: { color: '#e5e7eb', font: { size: 12 } },
            },
        },
        plugins: {
            legend: { display: false },
        },
    };

    const barData = {
        labels: result.roleFits.slice(0, 4).map((r) => r.title),
        datasets: [
            {
                label: 'Fit %',
                data: result.roleFits.slice(0, 4).map((r) => r.fitPercentage),
                backgroundColor: [
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                ],
                borderRadius: 8,
            },
        ],
    };

    const barOptions = {
        indexAxis: 'y' as const,
        scales: {
            x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
            y: { grid: { display: false }, ticks: { color: '#e5e7eb' } },
        },
        plugins: {
            legend: { display: false },
        },
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Your Assessment Results</h1>
                    <p className="text-gray-400">Comprehensive breakdown of your professional profile</p>
                </div>

                {/* AI Overview Section */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 mb-8 shadow-lg shadow-purple-500/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">AI Career Coach Insights</h2>
                            <p className="text-purple-300 text-sm">Personalized analysis powered by AI</p>
                        </div>
                    </div>

                    {aiLoading ? (
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                            <span>Generating your personalized career insights...</span>
                        </div>
                    ) : aiOverview ? (
                        <div className="text-gray-200 leading-relaxed space-y-4">
                            {aiOverview.split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">
                            AI insights are not available. Configure CEREBRAS_API_KEY to enable this feature.
                        </p>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Radar Chart */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6">Trait Profile</h2>
                        <div className="aspect-square max-w-md mx-auto">
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </div>

                    {/* Role Fit */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6">Role Fit Scores</h2>
                        <div className="h-64">
                            <Bar data={barData} options={barOptions} />
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {result.roleFits.slice(0, 4).map((role) => (
                                <div key={role.roleId} className="bg-white/5 rounded-xl p-4">
                                    <p className="text-gray-400 text-sm">{role.title}</p>
                                    <p className="text-2xl font-bold text-white">{role.fitPercentage}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Work Style Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <p className="text-purple-400 text-sm mb-2">Team Role</p>
                        <p className="text-2xl font-semibold text-white">{result.workStyle.teamRole}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <p className="text-pink-400 text-sm mb-2">Conflict Style</p>
                        <p className="text-2xl font-semibold text-white">{result.workStyle.conflictStyle}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <p className="text-blue-400 text-sm mb-2">Communication</p>
                        <p className="text-2xl font-semibold text-white">{result.workStyle.communicationStyle}</p>
                    </div>
                </div>

                {/* Composite Insights */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6">Culture Fit</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">Startup Environment</span>
                                    <span className="text-purple-400 font-semibold">{result.compositeInsights.cultureFit.startup}%</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${result.compositeInsights.cultureFit.startup}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">Corporate Environment</span>
                                    <span className="text-blue-400 font-semibold">{result.compositeInsights.cultureFit.corporate}%</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${result.compositeInsights.cultureFit.corporate}%` }} />
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Remote Work Readiness</span>
                                    <span className="text-green-400 font-semibold text-xl">{result.compositeInsights.remoteReadiness}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6">Career Path</h2>
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-2">Predicted Track</p>
                            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {result.compositeInsights.careerPath}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-3">Best Management Styles</p>
                            <div className="flex flex-wrap gap-2">
                                {result.compositeInsights.managementFit.map((style) => (
                                    <span key={style} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm capitalize">
                                        {style.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strengths & Risks */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="text-green-400">✓</span> Strengths
                        </h2>
                        <ul className="space-y-3">
                            {result.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="text-green-400 mt-1">•</span>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="text-amber-400">⚠</span> Areas to Watch
                        </h2>
                        <ul className="space-y-3">
                            {result.riskAreas.map((risk, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="text-amber-400 mt-1">•</span>
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quality Metrics */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <div className="flex flex-wrap gap-8 justify-center">
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Response Consistency</p>
                            <p className="text-2xl font-bold text-white">{result.qualityMetrics.consistency}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">Avg Response Time</p>
                            <p className="text-2xl font-bold text-white">{result.qualityMetrics.avgResponseTime}s</p>
                        </div>
                    </div>
                </div>

                {/* Retake Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => {
                            localStorage.removeItem('assessmentResult');
                            router.push('/');
                        }}
                        className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Take Assessment Again
                    </button>
                </div>
            </div>
        </main>
    );
}
