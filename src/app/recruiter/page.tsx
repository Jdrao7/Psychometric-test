'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

interface Stats {
    totalRoles: number;
    totalCandidates: number;
}

export default function RecruiterDashboard() {
    const [stats, setStats] = useState<Stats>({ totalRoles: 0, totalCandidates: 0 });

    useEffect(() => {
        fetch('/api/roles')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setStats((prev) => ({ ...prev, totalRoles: data.length }));
                }
            })
            .catch(console.error);

        fetch('/api/candidates')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setStats((prev) => ({ ...prev, totalCandidates: data.length }));
                }
            })
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="recruiter" showBack backHref="/" />

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Recruiter Dashboard</h1>
                    <p className="text-[var(--text-muted)]">Manage roles and view candidate matches</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="amara-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalRoles}</p>
                                <p className="text-sm text-[var(--text-muted)]">Roles Created</p>
                            </div>
                        </div>
                    </div>

                    <div className="amara-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCandidates}</p>
                                <p className="text-sm text-[var(--text-muted)]">Candidates Assessed</p>
                            </div>
                        </div>
                    </div>

                    <div className="amara-card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">Active</p>
                                <p className="text-sm text-[var(--text-muted)]">System Status</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <Link href="/recruiter/roles/new" className="group">
                        <div className="amara-card h-full hover:border-[var(--brand-primary)]/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                                    <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[var(--text-primary)] font-medium mb-1">Create New Role</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Define trait requirements manually or use AI to generate criteria
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/recruiter/roles" className="group">
                        <div className="amara-card h-full hover:border-[var(--brand-primary)]/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center group-hover:bg-[var(--brand-primary)]/10 transition-colors">
                                    <svg className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[var(--text-primary)] font-medium mb-1">View All Roles</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Browse and manage your role profiles
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/recruiter/candidates" className="group">
                        <div className="amara-card h-full hover:border-[var(--brand-accent)]/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center group-hover:bg-[var(--brand-accent)]/20 transition-colors">
                                    <svg className="w-6 h-6 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[var(--text-primary)] font-medium mb-1">View Candidates</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        See all assessed candidates with role matches
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <div className="amara-card h-full opacity-50 cursor-not-allowed">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[var(--text-primary)] font-medium mb-1">Analytics</h3>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Coming soon — deep insights into hiring patterns
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="amara-card bg-[var(--surface-elevated)]">
                    <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">Getting Started</h2>
                    <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-sm font-medium flex items-center justify-center flex-shrink-0">1</span>
                            <span className="text-[var(--text-secondary)]">Create a role with the traits you&apos;re looking for</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-sm font-medium flex items-center justify-center flex-shrink-0">2</span>
                            <span className="text-[var(--text-secondary)]">Share the candidate assessment link</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-sm font-medium flex items-center justify-center flex-shrink-0">3</span>
                            <span className="text-[var(--text-secondary)]">Review matches with clear Proceed / Probe / Pass ratings</span>
                        </li>
                    </ol>
                </div>
            </main>
        </div>
    );
}
