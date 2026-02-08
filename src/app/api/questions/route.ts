import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestions } from '@/lib/scoring';

export async function GET(request: NextRequest) {
    const questions = getAllQuestions();
    return NextResponse.json(questions);
}
