export interface AuthorSplitStrategy {
  detect: (text: string) => boolean;
  split: (text: string) => string[];
}

export type AuthorTransform = (text: string) => string;
