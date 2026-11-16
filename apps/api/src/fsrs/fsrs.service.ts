import { Injectable, OnModuleInit } from "@nestjs/common";
import { DefaultScheduler, DefaultSchedulerCard } from 'ts-fsrs'
import { CardState } from "../common/words/types/card-state.ts";

@Injectable()
export class FsrsService implements OnModuleInit {
    private scheduler!: DefaultScheduler;

    async onModuleInit() {
        await this.init();
    }

    private async init() {
        this.scheduler = await DefaultScheduler();
    }

    addCard(now: Date): CardState {
        return this.mapCardState(this.scheduler.newCard({ now }));
    }

    private mapCardState(card: DefaultSchedulerCard): CardState {
        return {
            stabilityFast: card.stabilityFast,
            stability: card.stability,
            difficulty: card.difficulty,
            dueAt: card.dueAt,
            lastReviewAt: card.lastReviewAt ?? undefined,
            reps: card.reps,
            lapses: card.lapses,
            scheduledDays: card.scheduledDays,
            learningStep: card.learningStep,
        };
    }
}