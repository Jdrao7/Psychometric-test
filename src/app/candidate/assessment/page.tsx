'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Question } from '@/lib/types';

interface Response {
    questionId: number;
    optionId: string;
    responseTime: number;
}

export default function AssessmentPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Response[]>([]);
    const [startTime, setStartTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/questions')
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setLoading(false);
                setStartTime(Date.now());
            })
            .catch((err) => {
                console.error('Failed to load questions:', err);
                setLoading(false);
            });
    }, []);

    const handleAnswer = async (optionId: string) => {
        const responseTime = Date.now() - startTime;
        const newResponse: Response = {
            questionId: questions[currentIndex].id,
            optionId,
            responseTime,
        };

        const newResponses = [...responses, newResponse];
        setResponses(newResponses);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setStartTime(Date.now());
        } else {
            setSubmitting(true);
            try {
                const res = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ responses: newResponses }),
                });
                const result = await res.json();
                localStorage.setItem('assessmentResult', JSON.stringify(result));
                router.push('/candidate/results');
            } catch (error) {
                console.error('Submission error:', error);
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen surface-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--brand-primary)] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Loading assessment...</p>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="min-h-screen surface-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--brand-primary)] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Analyzing your responses...</p>
                </div>
            </div>
        );
    }

    const question = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen surface-gradient">
            <Header variant="candidate" />

            <div className="w-full h-1 bg-white/5">
                <div
                    className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className="container mx-auto px-6 py-12 max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-sm text-[var(--text-muted)]">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="amara-badge amara-badge-info">
                        {question.category || 'Behavioral'}
                    </span>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-medium text-[var(--text-primary)] leading-relaxed">
                        {question.text}
                    </h2>
                </div>

                <div className="space-y-3">
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleAnswer(option.id)}
                            className="w-full text-left amara-card hover:border-[var(--brand-primary)]/50 transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)] font-medium group-hover:bg-[var(--brand-primary)]/10 group-hover:text-[var(--brand-primary)] transition-colors">
                                    {option.id}
                                </div>
                                <span className="text-[var(--text-primary)]">{option.text}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
