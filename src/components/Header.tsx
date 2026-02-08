import Link from 'next/link';

interface HeaderProps {
    variant?: 'candidate' | 'recruiter' | 'default';
    showBack?: boolean;
    backHref?: string;
}

export default function Header({ variant = 'default', showBack, backHref = '/' }: HeaderProps) {
    return (
        <header className="w-full border-b border-white/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-[var(--text-primary)] font-semibold text-lg">
                        Amara AI
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {variant !== 'default' && (
                        <span className="text-[var(--text-muted)] text-sm">
                            {variant === 'candidate' ? 'Candidate Portal' : 'Recruiter Portal'}
                        </span>
                    )}

                    {showBack && (
                        <Link
                            href={backHref}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
