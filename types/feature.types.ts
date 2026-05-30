export interface NotesOutput {
  title: string;
  sections: NotesSection[];
}

export interface NotesSection {
  heading: string;
  subheadings: NotesSubheading[];
}

export interface NotesSubheading {
  title: string;
  content: string[];
  callouts?: string[];
}

export interface Flashcard {
  front: string;
  back: string;
  category?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  detail?: string;
}

export interface RevisionOutput {
  title: string;
  definitions: string[];
  formulas: string[];
  keyFacts: string[];
  dates: { event: string; date: string }[];
  summaryBullets: string[];
}

export interface FeatureOption {
  count: number;
  difficulty: "easy" | "medium" | "hard";
  mode: "compact" | "detailed";
}
