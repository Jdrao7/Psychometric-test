'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function CandidatePage() {
    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="candidate" showBack backHref="/" />

            <main className="container mx-auto px-6 py-16 max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                        Discover Your Profile
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Complete a 40-question assessment to uncover your professional strengths,
                        work style, and ideal career matches.
                    </p>
                </div>

                <div className="amara-card mb-8">
                    <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                        What you&apos;ll discover
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)]">7 Core Traits</p>
                                <p className="text-sm text-[var(--text-muted)]">Extraversion, Conscientiousness, Emotional Stability, and more</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)]">Role Fit Analysis</p>
                                <p className="text-sm text-[var(--text-muted)]">See how you match different job profiles</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)]">AI-Powered Insights</p>
                                <p className="text-sm text-[var(--text-muted)]">Get personalized career guidance</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="amara-card bg-[var(--surface-elevated)] mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <svg className="w-5 h-5 text-[var(--status-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[var(--text-primary)] font-medium">About 10 minutes</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                        Answer honestly — there are no right or wrong answers.
                        Your responses are confidential.
                    </p>
                </div>

                <Link
                    href="/candidate/assessment"
                    className="amara-btn amara-btn-primary w-full h-14 text-base font-semibold"
                >
                    Begin Assessment
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </main>
        </div>
    );
}
