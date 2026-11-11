
export enum ScheduleStatus {
  review = 'review',
  new = 'new',
  learning = 'learning'
}

export enum WordStatus {
  new = 'new',
  learning = 'learning',
  review = 'review',
  relearning = 'relearning'
}

export enum PartOfSpeech {
  noun = 'noun',
  verb = 'verb',
  adjective = 'adjective',
  adverb = 'adverb',
  pronoun = 'pronoun',
  preposition = 'preposition',
  conjunction = 'conjunction',
  interjection = 'interjection',
  numeral = 'numeral',
}

export enum Article {
  het = 'het',
  de = 'de',
  none = 'none'
}

export enum Language {
  en = 'en',
  uk = 'uk',
  it = 'it',
  es = 'es',
  de = 'de',
  pl = 'pl',
  da = 'da',
  fi = 'fi'
}

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