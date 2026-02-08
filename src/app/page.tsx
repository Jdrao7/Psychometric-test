import Link from 'next/link';
import Header from '@/components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen surface-gradient">
      <Header />

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            Hire with <span className="text-gradient">Insight</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            AI-powered psychometric assessments that reveal the complete picture
            of every candidate.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Candidate Card */}
          <Link href="/candidate" className="group">
            <div className="amara-card h-full flex flex-col hover:border-[var(--brand-primary)]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                <svg className="w-7 h-7 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                I&apos;m a Candidate
              </h2>
              <p className="text-[var(--text-muted)] text-sm mb-6 flex-1">
                Take a 10-minute assessment and discover your professional strengths,
                work style, and ideal role matches.
              </p>

              <div className="flex items-center gap-2 text-[var(--brand-primary)] text-sm font-medium group-hover:gap-3 transition-all">
                Start Assessment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Recruiter Card */}
          <Link href="/recruiter" className="group">
            <div className="amara-card h-full flex flex-col hover:border-[var(--brand-accent)]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--brand-accent)]/20 transition-colors">
                <svg className="w-7 h-7 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                I&apos;m a Recruiter
              </h2>
              <p className="text-[var(--text-muted)] text-sm mb-6 flex-1">
                Create role profiles, set trait requirements, and get AI-powered
                candidate matches with clear ratings.
              </p>

              <div className="flex items-center gap-2 text-[var(--brand-accent)] text-sm font-medium group-hover:gap-3 transition-all">
                Open Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">7 Core Traits</h3>
            <p className="text-[var(--text-muted)] text-sm">
              Comprehensive assessment covering personality, cognition, and work style.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--status-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">AI-Powered Insights</h3>
            <p className="text-[var(--text-muted)] text-sm">
              Get honest, actionable feedback powered by advanced language models.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">Clear Ratings</h3>
            <p className="text-[var(--text-muted)] text-sm">
              Proceed, Probe, or Pass — instant clarity on every candidate match.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-24">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            © 2024 Amara AI. Built for better hiring decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
