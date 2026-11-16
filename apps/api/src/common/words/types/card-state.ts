export interface CardState {
    stabilityFast: number;
    stability: number;
    difficulty: number;
    dueAt: Date;
    lastReviewAt?: Date;
    reps: number;
    lapses: number;
    scheduledDays: number;
    learningStep: number;
}