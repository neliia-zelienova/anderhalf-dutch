export enum WordStatus {
    New = 'new',
    Learning = 'learning',
    Mastered = 'mastered',
}

export type Article = 'het' | 'de';

export interface Word {
    id: string;
    word: string;
    article: Article;
}

export interface UserWord {
    userId: string;
    wordId: string;
    status?: WordStatus;
    exampleSentence: string;
    translation: string;
    createdAt: Date;
}