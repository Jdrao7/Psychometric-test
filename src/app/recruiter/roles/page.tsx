'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Role {
    id: string;
    title: string;
    description?: string;
    culture_preference?: string;
    is_ai_generated?: boolean;
    created_at?: string;
}

export default function RolesListPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/roles')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setRoles(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="recruiter" showBack backHref="/recruiter" />

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Roles</h1>
                        <p className="text-[var(--text-muted)]">{roles.length} role{roles.length !== 1 ? 's' : ''} created</p>
                    </div>
                    <Link href="/recruiter/roles/new" className="amara-btn amara-btn-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Role
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--brand-primary)] border-t-transparent"></div>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="amara-card text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">No roles yet</h2>
                        <p className="text-[var(--text-muted)] mb-6">Create your first role to start matching candidates</p>
                        <Link href="/recruiter/roles/new" className="amara-btn amara-btn-primary">
                            Create Role
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roles.map((role) => (
                            <div key={role.id} className="amara-card hover:border-[var(--brand-primary)]/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-lg font-medium text-[var(--text-primary)]">{role.title}</h2>
                                            {role.is_ai_generated && (
                                                <span className="amara-badge amara-badge-info">AI</span>
                                            )}
                                            {role.culture_preference && (
                                                <span className="text-xs text-[var(--text-muted)] capitalize">{role.culture_preference}</span>
                                            )}
                                        </div>
                                        {role.description && (
                                            <p className="text-sm text-[var(--text-muted)] line-clamp-2">{role.description}</p>
                                        )}
                                        {role.created_at && (
                                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                                Created {new Date(role.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        href={`/recruiter/roles/${role.id}`}
                                        className="amara-btn amara-btn-ghost text-sm"
                                    >
                                        View
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
