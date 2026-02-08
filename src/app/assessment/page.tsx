'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Response } from '@/lib/types';

interface Question {
    id: number;
    type: string;
    trait?: string;
    category?: string;
    text: string;
    options: { id: string; text: string; value?: number | string }[];
    reverse?: boolean;
    correctAnswer?: string;
}

export default function AssessmentPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Response[]>([]);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/questions')
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setLoading(false);
                setQuestionStartTime(Date.now());
            });
    }, []);

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    const handleAnswer = useCallback((optionId: string) => {
        const responseTime = Date.now() - questionStartTime;

        setResponses((prev) => [
            ...prev.filter((r) => r.questionId !== currentQuestion.id),
            { questionId: currentQuestion.id, optionId, responseTime },
        ]);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setQuestionStartTime(Date.now());
        }
    }, [currentIndex, currentQuestion, questionStartTime, questions.length]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses }),
            });
            const result = await res.json();

            // Store result in localStorage for the results page
            localStorage.setItem('assessmentResult', JSON.stringify(result));
            router.push('/results');
        } catch (error) {
            console.error('Error submitting:', error);
            setSubmitting(false);
        }
    };

    const isLastQuestion = currentIndex === questions.length - 1;
    const currentResponse = responses.find((r) => r.questionId === currentQuestion?.id);

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading questions...</div>
            </main>
        );
    }

    const getQuestionTypeLabel = () => {
        if (currentQuestion.type === 'likert') return 'Rate your agreement';
        if (currentQuestion.type === 'mcq') return 'Select the correct answer';
        if (currentQuestion.type === 'forced_choice') return 'Choose one';
        if (currentQuestion.type === 'scenario') return 'What would you do?';
        return '';
    };

    const getSectionLabel = () => {
        if (currentIndex < 25) return 'Behavioral Assessment';
        if (currentIndex < 33) return 'Cognitive Assessment';
        return 'Work Style Assessment';
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-purple-300 text-sm font-medium">{getSectionLabel()}</span>
                        <span className="text-gray-400 text-sm">
                            {currentIndex + 1} / {questions.length}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl">
                    <p className="text-purple-400 text-sm mb-4 uppercase tracking-wide">
                        {getQuestionTypeLabel()}
                    </p>

                    <h2 className="text-2xl md:text-3xl text-white font-semibold mb-8 leading-relaxed">
                        {currentQuestion.text}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.type === 'likert' ? (
                            // Likert Scale
                            <div className="flex flex-col gap-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${currentResponse?.optionId === option.id
                                                ? 'bg-purple-600 border-purple-400 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <span className="font-medium">{option.text}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // MCQ, Forced Choice, Scenario
                            <div className="grid gap-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        className={`p-4 rounded-xl text-left transition-all duration-200 border ${currentResponse?.optionId === option.id
                                                ? 'bg-purple-600 border-purple-400 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <span className="inline-flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${currentResponse?.optionId === option.id
                                                    ? 'bg-white/20'
                                                    : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                {option.id}
                                            </span>
                                            <span>{option.text}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>

                    {isLastQuestion && currentResponse ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? 'Calculating Results...' : 'View Results'}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (currentResponse && currentIndex < questions.length - 1) {
                                    setCurrentIndex((prev) => prev + 1);
                                    setQuestionStartTime(Date.now());
                                }
                            }}
                            disabled={!currentResponse}
                            className="px-6 py-3 rounded-xl text-purple-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
