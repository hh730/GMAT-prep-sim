export interface GmatTerm {
  term: string;
  definition: string;
  plainEnglish: string; // Explaining to someone struggling with technical jargon
  gmatTip: string; // Strategy for not getting stuck on this scientific term
}

export interface GmatSentenceAnalysis {
  sentence: string;
  simplified: string;
  subject: string;
  mainVerb: string;
  modifiers: string[];
}

export interface GmatQuestion {
  id: string;
  questionText: string;
  questionType: 'Reading Comprehension' | 'Critical Reasoning';
  subType: 'Main Idea' | 'Inference' | 'Detail' | 'Structure' | 'Strengthen/Weaken' | 'Assumption';
  options: string[];
  correctAnswerIndex: number;
  explanation: {
    correct: string;
    incorrect: { [key: number]: string };
    gmatStrategy: string;
  };
}

export interface GmatPassage {
  id: string;
  title: string;
  discipline: 'biology' | 'physics' | 'astronomy';
  difficulty: '600-650' | '650-700' | '700-750' | '750+';
  content: string; // The markdown/text content of the passage
  terms: GmatTerm[]; // Underlined/hoverable terms
  complexSentences: GmatSentenceAnalysis[]; // Highlightable complex sentences for parsing
  questions: GmatQuestion[];
  scoreBoostTips: string[]; // 3 quick, tailored advice points for GMAT science Gmat score boost from 605 to 705
}

export interface StudySession {
  passageId: string;
  timeSpentSeconds: number;
  answers: { [questionId: string]: number }; // questionId -> selected index
  score: number; // Percentage
  completedAt: string;
}

export interface FriendGoalStats {
  currentScore: number; // e.g. 605
  targetScore: number; // e.g. 705
  passagesRead: number;
  questionsAnswered: number;
  accuracy: number; // e.g., 68 (representing 68%)
  disciplinePerformance: {
    biology: { answered: number; correct: number };
    physics: { answered: number; correct: number };
    astronomy: { answered: number; correct: number };
  };
  scoreMilestones: { score: number; date: string }[];
}
