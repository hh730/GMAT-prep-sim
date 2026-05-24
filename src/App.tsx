import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Award, 
  Brain, 
  Clock, 
  Sparkles, 
  BookMarked, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Plus, 
  FileText, 
  Layers, 
  HelpCircle, 
  Check, 
  AlertTriangle,
  Play,
  Pause,
  Maximize,
  Lightbulb,
  Search,
  MessageSquare,
  Bookmark,
  Activity,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Globe,
  PlusCircle,
  MinusCircle,
  HelpCircle as MathIcon,
  BookOpenCheck,
  ArrowRight
} from 'lucide-react';
import { defaultPassages } from './data/defaultPassages';
import { GmatPassage, GmatQuestion, FriendGoalStats } from './types';
import { mockMathQuestions, GmatMathQuestion } from './data/mockMathQuestions';

// Simple helper to parse helper markdown bold text nicely
function parseSimpleMarkdown(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function App() {
  // Navigation Tabs: 'science' for Science Passages, 'maths' for Quant Practice
  const [navigationTab, setNavigationTab] = useState<'science' | 'maths'>('science');

  // Passages State: init with default passages, extend with localStorage cached generated passages
  const [passages, setPassages] = useState<GmatPassage[]>(() => {
    const saved = localStorage.getItem('gmat_passages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filteredSaved = parsed.filter((p: GmatPassage) => !defaultPassages.some(dp => dp.id === p.id));
        return [...defaultPassages, ...filteredSaved];
      } catch (e) {
        return defaultPassages;
      }
    }
    return defaultPassages;
  });

  const [selectedPassageId, setSelectedPassageId] = useState<string>(defaultPassages[0].id);
  const activePassage = passages.find(p => p.id === selectedPassageId) || passages[0];

  // Collapsible settings toolbar top bar
  const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(false);

  // Learning states for Science Passages
  const [activeTab, setActiveTab] = useState<'sim' | 'deconstruct' | 'scratchpad'>('sim');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [qId: string]: boolean }>({});
  
  // Highlighting and breakdown states for Deep Study Tab
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState<{ [passageId: string]: string }>({});

  // Real-time custom GMAT AI Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [genDiscipline, setGenDiscipline] = useState<'biology' | 'physics' | 'astronomy'>('biology');
  const [genDifficulty, setGenDifficulty] = useState<'600-650' | '650-700' | '700-750' | '750+'>('700-750');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [loadingStepText, setLoadingStepText] = useState('');

  // Exam Simulation Mode Config
  const [examMode, setExamMode] = useState<'practice' | 'exam'>('practice'); // 'practice' = immediate feedback, 'exam' = submit all at end
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Custom Highlights State
  const [passageHighlights, setPassageHighlights] = useState<{ [passageId: string]: { text: string; id: number }[] }>({});
  
  // GMAT Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // ---------------- GMAT MATHS QUANT PRACTICE STATES ----------------
  const [activeMathTopic, setActiveMathTopic] = useState<'algebra' | 'arithmetic' | 'word-problems' | 'number-properties' | 'rates-and-work' | 'ratios-and-percents' | 'statistics-and-data'>('algebra');
  const [mathDifficulty, setMathDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Track the number of solved questions per difficulty
  const [mathDifficultySolved, setMathDifficultySolved] = useState<{ easy: number, medium: number, hard: number }>(() => {
    const saved = localStorage.getItem('gmat_math_difficulty_solved');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          easy: parsed.easy ?? 18,
          medium: parsed.medium ?? 14,
          hard: parsed.hard ?? 5
        };
      } catch (e) {}
    }
    return { easy: 18, medium: 14, hard: 5 };
  });
  
  // Maths Progress - Solved question counts with goals of 40-50 per topic
  const [mathCompletedCounts, setMathCompletedCounts] = useState<{ [topic: string]: number }>(() => {
    const saved = localStorage.getItem('gmat_math_counts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          'algebra': parsed.algebra ?? 15,
          'arithmetic': parsed.arithmetic ?? 12,
          'word-problems': parsed['word-problems'] ?? 8,
          'number-properties': parsed['number-properties'] ?? 10,
          'rates-and-work': parsed['rates-and-work'] ?? 7,
          'ratios-and-percents': parsed['ratios-and-percents'] ?? 11,
          'statistics-and-data': parsed['statistics-and-data'] ?? 6,
        };
      } catch (e) {}
    }
    return {
      'algebra': 15,
      'arithmetic': 12,
      'word-problems': 8,
      'number-properties': 10,
      'rates-and-work': 7,
      'ratios-and-percents': 11,
      'statistics-and-data': 6,
    };
  });

  // Cached generated or loaded math questions (by topic) to save Gemini tokens
  const [topicMathQuestions, setTopicMathQuestions] = useState<{ [topic: string]: GmatMathQuestion[] }>(() => {
    const saved = localStorage.getItem('gmat_math_catalog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          'algebra': parsed.algebra || [mockMathQuestions[0]],
          'arithmetic': parsed.arithmetic || [mockMathQuestions[1]],
          'word-problems': parsed['word-problems'] || [mockMathQuestions[2]],
          'number-properties': parsed['number-properties'] || [mockMathQuestions[3]],
          'rates-and-work': parsed['rates-and-work'] || [mockMathQuestions[4]],
          'ratios-and-percents': parsed['ratios-and-percents'] || [mockMathQuestions[5]],
          'statistics-and-data': parsed['statistics-and-data'] || [mockMathQuestions[6]],
        };
      } catch (e) {}
    }
    // Prepopulate with offline baselines
    return {
      'algebra': [mockMathQuestions[0]],
      'arithmetic': [mockMathQuestions[1]],
      'word-problems': [mockMathQuestions[2]],
      'number-properties': [mockMathQuestions[3]],
      'rates-and-work': [mockMathQuestions[4]],
      'ratios-and-percents': [mockMathQuestions[5]],
      'statistics-and-data': [mockMathQuestions[6]],
    };
  });

  // Currently loaded math question index for active topic
  const [activeMathQuestionIndex, setActiveMathQuestionIndex] = useState<{ [topic: string]: number }>({
    'algebra': 0,
    'arithmetic': 0,
    'word-problems': 0,
    'number-properties': 0,
    'rates-and-work': 0,
    'ratios-and-percents': 0,
    'statistics-and-data': 0,
  });

  const [isGeneratingMath, setIsGeneratingMath] = useState<boolean>(false);
  const [mathError, setMathError] = useState<string | null>(null);
  const [mathSelectedAnswer, setMathSelectedAnswer] = useState<number | null>(null);
  const [mathAnswerSubmitted, setMathAnswerSubmitted] = useState<boolean>(false);

  // ---------------- CHATBOT SIDEBAR CONTEXT STATES ----------------
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatType, setChatType] = useState<'gemini' | 'search'>('gemini');
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    links?: Array<{ title: string; uri: string }>;
  }>>([
    {
      role: 'assistant',
      text: "Hello! I am your personal GMAT Cognitive Tutor. Ask me any doubt about the current **Science Passage** or **Math Question**! I am fully aware of your context so you don't have to copy-paste. Toggle 'Google Search Grounding' if you want me to search the web for proven tricks."
    }
  ]);

  // Stats / Progress tracking state (Score targets)
  const [stats, setStats] = useState<FriendGoalStats>(() => {
    const saved = localStorage.getItem('gmat_friend_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      currentScore: 605,
      targetScore: 705,
      passagesRead: defaultPassages.length,
      questionsAnswered: 15,
      accuracy: 72,
      disciplinePerformance: {
        biology: { answered: 6, correct: 4 },
        physics: { answered: 5, correct: 4 },
        astronomy: { answered: 4, correct: 3 }
      },
      scoreMilestones: [{ score: 605, date: 'May 2026' }]
    };
  });

  // Calculate dynamic GMAT Score (605 to 705)
  const calculateEstimatedGmatScore = (currentStats: FriendGoalStats, mathSolvedSum: number) => {
    const base = 605;
    
    // Volume factors
    const mathVolumeFactor = Math.min(mathSolvedSum * 0.8, 45); // up to +45 points for maths practice volume
    const verbalVolumeFactor = Math.min(currentStats.passagesRead * 4, 25); // up to +25 points for passages
    
    // Accuracy factor
    const accuracyFactor = (currentStats.accuracy - 70) * 1.2; // if accuracy is high, gives a solid lift
    
    const estimated = Math.round(base + mathVolumeFactor + verbalVolumeFactor + accuracyFactor);
    return Math.max(605, Math.min(805, estimated));
  };

  const totalMathQuestionsSolved = (Object.values(mathCompletedCounts) as number[]).reduce((a: number, b: number) => a + b, 0);
  const estimatedScore = calculateEstimatedGmatScore(stats, totalMathQuestionsSolved);

  // Timer runner
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Save passages
  const savePassages = (newPassages: GmatPassage[]) => {
    localStorage.setItem('gmat_passages', JSON.stringify(newPassages));
    setPassages(newPassages);
  };

  // Save stats
  const saveStats = (newStats: FriendGoalStats) => {
    localStorage.setItem('gmat_friend_stats', JSON.stringify(newStats));
    setStats(newStats);
  };

  // Save math counts
  const updateMathCount = (topic: string, amount: number) => {
    const updated = {
      ...mathCompletedCounts,
      [topic]: Math.max(0, Math.min(100, mathCompletedCounts[topic] + amount))
    };
    localStorage.setItem('gmat_math_counts', JSON.stringify(updated));
    setMathCompletedCounts(updated);
  };

  // Save math difficulty counts
  const updateMathDifficultyCount = (diff: 'easy' | 'medium' | 'hard', amount: number) => {
    const updated = {
      ...mathDifficultySolved,
      [diff]: Math.max(0, mathDifficultySolved[diff] + amount)
    };
    localStorage.setItem('gmat_math_difficulty_solved', JSON.stringify(updated));
    setMathDifficultySolved(updated);
  };

  // Select verbal passage
  const selectPassage = (id: string) => {
    setSelectedPassageId(id);
    setSelectedQuestionIndex(0);
    setUserAnswers({});
    setSubmittedQuestions({});
    setExamSubmitted(false);
    setSelectedTerm(null);
    setSelectedSentence(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  // Loading animations steps
  useEffect(() => {
    if (!isGenerating) return;
    const steps = [
      "Securing connection with Gemini AI...",
      "Sourcing cutting-edge scientific paradigms...",
      "Drafting extremely convoluted academic descriptions...",
      "Injecting passive verb structures & conditional sub-clauses...",
      "Crafting high-intensity GMAT Reading Comprehension questions...",
      "Formulating devious trap answers (out-of-scope, half-true details)...",
      "Drafting ELI5 plain English breakdown translations...",
      "Structuring 705-level score booster strategic notes..."
    ];
    let count = 0;
    setLoadingStepText(steps[0]);
    const interval = setInterval(() => {
      count = (count + 1) % steps.length;
      setLoadingStepText(steps[count]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Passage Compiler Handler
  const generateNewAiPassage = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch('/api/generate-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline: genDiscipline,
          difficulty: genDifficulty
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned an error generating the passage.');
      }

      const newPassage: GmatPassage = await response.json();
      newPassage.id = `ai-gen-${Date.now()}`;
      
      const updatedList = [newPassage, ...passages];
      savePassages(updatedList);
      selectPassage(newPassage.id);
      setIsSettingsExpanded(false); // Close settings panel once complete
      
      saveStats({
        ...stats,
        passagesRead: stats.passagesRead + 1
      });

    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Connecting to backend server failed. Make sure your GEMINI_API_KEY is active.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------- MATH ACTIONS ----------------
  const currentTopicQuestions = topicMathQuestions[activeMathTopic] || [];
  const currentTopicIndex = activeMathQuestionIndex[activeMathTopic] || 0;
  const currentMathQ = currentTopicQuestions[currentTopicIndex] || mockMathQuestions.find(q => q.topic === activeMathTopic) || mockMathQuestions[0];

  // Dynamic GMAT Mathematics Generation
  const generateNewMathQuestion = async () => {
    setIsGeneratingMath(true);
    setMathError(null);
    try {
      const response = await fetch('/api/generate-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeMathTopic,
          difficulty: mathDifficulty
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned error creating math question.');
      }

      const freshMathQ: GmatMathQuestion = await response.json();
      
      // Update our catalog state & localStorage
      const updatedCatalog = { ...topicMathQuestions };
      if (!updatedCatalog[activeMathTopic]) {
        updatedCatalog[activeMathTopic] = [];
      }
      
      // Append so they can cycle backwards offline!
      updatedCatalog[activeMathTopic] = [...updatedCatalog[activeMathTopic], freshMathQ];
      
      localStorage.setItem('gmat_math_catalog', JSON.stringify(updatedCatalog));
      setTopicMathQuestions(updatedCatalog);

      // Point the index to the newly generated question at the end
      setActiveMathQuestionIndex({
        ...activeMathQuestionIndex,
        [activeMathTopic]: updatedCatalog[activeMathTopic].length - 1
      });

      // Reset interaction
      setMathSelectedAnswer(null);
      setMathAnswerSubmitted(false);

    } catch (err: any) {
      console.error(err);
      setMathError(err.message || 'Failed to contact Gemini for dynamic math question generation.');
    } finally {
      setIsGeneratingMath(false);
    }
  };

  // Cycle Next Local Baseline Question (saves API cost!)
  const cycleNextLocalMathQuestion = () => {
    const list = mockMathQuestions.filter(q => q.topic === activeMathTopic);
    if (list.length === 0) return;
    
    // Find if we should inject next local question
    const updatedCatalog = { ...topicMathQuestions };
    if (!updatedCatalog[activeMathTopic]) {
      updatedCatalog[activeMathTopic] = [];
    }
    
    // Find next baseline question not in our local catalog list
    const remainingBaselines = list.filter(bq => !updatedCatalog[activeMathTopic].some(q => q.id === bq.id));
    
    if (remainingBaselines.length > 0) {
      updatedCatalog[activeMathTopic] = [...updatedCatalog[activeMathTopic], remainingBaselines[0]];
      localStorage.setItem('gmat_math_catalog', JSON.stringify(updatedCatalog));
      setTopicMathQuestions(updatedCatalog);
      
      setActiveMathQuestionIndex({
        ...activeMathQuestionIndex,
        [activeMathTopic]: updatedCatalog[activeMathTopic].length - 1
      });
    } else {
      // Loop around existing ones for this topic
      const nextIdx = (currentTopicIndex + 1) % updatedCatalog[activeMathTopic].length;
      setActiveMathQuestionIndex({
        ...activeMathQuestionIndex,
        [activeMathTopic]: nextIdx
      });
    }

    setMathSelectedAnswer(null);
    setMathAnswerSubmitted(false);
  };

  // Cycle Previous Math
  const cyclePrevMathQuestion = () => {
    const topicList = topicMathQuestions[activeMathTopic] || [];
    if (topicList.length <= 1) return;
    
    const prevIdx = (currentTopicIndex - 1 + topicList.length) % topicList.length;
    setActiveMathQuestionIndex({
      ...activeMathQuestionIndex,
      [activeMathTopic]: prevIdx
    });
    setMathSelectedAnswer(null);
    setMathAnswerSubmitted(false);
  };

  // Evaluate Math Answer
  const submitMathAnswer = () => {
    if (mathSelectedAnswer === null) return;
    setMathAnswerSubmitted(true);

    const isCorrect = mathSelectedAnswer === currentMathQ.correctAnswerIndex;
    if (isCorrect) {
      // Automatically increment solved count toward the 40-50 progress indicator!
      updateMathCount(activeMathTopic, 1);
      
      // Increment difficulty solved metrics as well
      updateMathDifficultyCount(currentMathQ.difficulty, 1);
    }

    // Update global progress accuracy slightly
    const totalAns = stats.questionsAnswered + 1;
    const prevCorrect = Math.round((stats.accuracy / 100) * stats.questionsAnswered);
    const newCorrectCount = isCorrect ? prevCorrect + 1 : prevCorrect;
    const newAccuracy = Math.round((newCorrectCount / totalAns) * 100);

    saveStats({
      ...stats,
      questionsAnswered: totalAns,
      accuracy: newAccuracy
    });
  };

  // Handle moving to the next question of the currently selected difficulty
  const goToNextMathQuestion = () => {
    const list = topicMathQuestions[activeMathTopic] || [];
    
    // Find all indices of the current topic questions that match the selected mathDifficulty
    const matchingIndices = list
      .map((q, idx) => ({ q, idx }))
      .filter(item => item.q.difficulty === mathDifficulty);

    // Look for a matching question whose index is GREATER than currentTopicIndex
    const nextItem = matchingIndices.find(item => item.idx > currentTopicIndex);

    if (nextItem) {
      setActiveMathQuestionIndex({
        ...activeMathQuestionIndex,
        [activeMathTopic]: nextItem.idx
      });
      setMathSelectedAnswer(null);
      setMathAnswerSubmitted(false);
    } else {
      // No more cached questions of this difficulty further down. Let's see if there is any offline baseline question of this topic & difficulty we haven't seen yet.
      const offlineBaselines = mockMathQuestions.filter(q => q.topic === activeMathTopic && q.difficulty === mathDifficulty);
      const unusedBaseline = offlineBaselines.find(bq => !list.some(q => q.id === bq.id));

      if (unusedBaseline) {
        const updatedCatalog = { ...topicMathQuestions };
        updatedCatalog[activeMathTopic] = [...(updatedCatalog[activeMathTopic] || []), unusedBaseline];
        localStorage.setItem('gmat_math_catalog', JSON.stringify(updatedCatalog));
        setTopicMathQuestions(updatedCatalog);

        setActiveMathQuestionIndex({
          ...activeMathQuestionIndex,
          [activeMathTopic]: updatedCatalog[activeMathTopic].length - 1
        });
        setMathSelectedAnswer(null);
        setMathAnswerSubmitted(false);
      } else {
        // No match found anywhere, let's trigger a dynamic AI generation of the selected difficulty level!
        generateNewMathQuestion();
      }
    }
  };

  // ---------------- CHATBOT / COGNITIVE TUTOR ENDPOINT ACTIONS ----------------
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSendingChat(true);

    try {
      // Package active states for extreme context awareness
      const payload: any = {
        query: userMsg,
        type: chatType,
      };

      if (navigationTab === 'science') {
        payload.activePassageTitle = activePassage.title;
        payload.activePassageContent = activePassage.content;
      } else {
        payload.mathContext = `Math Topic: ${activeMathTopic}\nDifficulty: ${currentMathQ.difficulty}\nQuestion: ${currentMathQ.questionText}\nOptions: ${currentMathQ.options.join(', ')}`;
      }

      const response = await fetch('/api/chatbot-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMsg = 'Server returned error while consulting tutor.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: data.text,
        links: data.searchLinks
      }]);

    } catch (err: any) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ **Connection issue:** I couldn't reach the cognitive core. Please verify your GEMINI_API_KEY in Settings.\n\nError: ${err.message}`
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // ---------------- VERBAL COMMITS ----------------
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (examMode === 'exam' && examSubmitted) return;
    const currentQ = activePassage.questions[questionIndex];
    if (examMode === 'practice' && submittedQuestions[currentQ.id]) return;

    setUserAnswers({
      ...userAnswers,
      [currentQ.id]: optionIndex
    });
  };

  const submitPracticeAnswer = (q: GmatQuestion) => {
    const selected = userAnswers[q.id];
    if (selected === undefined) return;

    setSubmittedQuestions({
      ...submittedQuestions,
      [q.id]: true
    });

    const isCorrect = selected === q.correctAnswerIndex;
    
    const totalAns = stats.questionsAnswered + 1;
    const prevCorrect = Math.round((stats.accuracy / 100) * stats.questionsAnswered);
    const newCorrectCount = isCorrect ? prevCorrect + 1 : prevCorrect;
    const newAccuracy = Math.round((newCorrectCount / totalAns) * 100);

    const currentDiscStats = stats.disciplinePerformance[activePassage.discipline] || { answered: 0, correct: 0 };
    const updatedDisc = {
      ...stats.disciplinePerformance,
      [activePassage.discipline]: {
        answered: currentDiscStats.answered + 1,
        correct: isCorrect ? currentDiscStats.correct + 1 : currentDiscStats.correct
      }
    };

    saveStats({
      ...stats,
      questionsAnswered: totalAns,
      accuracy: newAccuracy,
      disciplinePerformance: updatedDisc
    });
  };

  const submitExamSuite = () => {
    setExamSubmitted(true);
    setIsTimerRunning(false);

    let numberCorrect = 0;
    let questionsCount = activePassage.questions.length;

    activePassage.questions.forEach(q => {
      const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
      if (isCorrect) numberCorrect++;
    });

    const totalAns = stats.questionsAnswered + questionsCount;
    const prevCorrect = Math.round((stats.accuracy / 100) * stats.questionsAnswered);
    const newCorrectCount = prevCorrect + numberCorrect;
    const newAccuracy = Math.round((newCorrectCount / totalAns) * 100);

    const currentDiscStats = stats.disciplinePerformance[activePassage.discipline] || { answered: 0, correct: 0 };
    const updatedDisc = {
      ...stats.disciplinePerformance,
      [activePassage.discipline]: {
        answered: currentDiscStats.answered + questionsCount,
        correct: currentDiscStats.correct + numberCorrect
      }
    };

    saveStats({
      ...stats,
      passagesRead: stats.passagesRead + 1,
      questionsAnswered: totalAns,
      accuracy: newAccuracy,
      disciplinePerformance: updatedDisc
    });
  };

  // Highlights helpers
  const addManualColorHighlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const selectedText = sel.toString().trim();
    if (selectedText.length < 3) return;

    const list = passageHighlights[activePassage.id] || [];
    if (list.some(h => h.text === selectedText)) return;

    setPassageHighlights({
      ...passageHighlights,
      [activePassage.id]: [...list, { text: selectedText, id: Date.now() }]
    });
    sel.removeAllRanges();
  };

  const removeManualHighlight = (id: number) => {
    const list = passageHighlights[activePassage.id] || [];
    setPassageHighlights({
      ...passageHighlights,
      [activePassage.id]: list.filter(h => h.id !== id)
    });
  };

  const clearAllPassageHighlights = () => {
    setPassageHighlights({
      ...passageHighlights,
      [activePassage.id]: []
    });
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderInteractiveContent = () => {
    let contentHtml = activePassage.content;
    
    return (
      <div className="prose prose-slate max-w-none font-serif text-[17px] leading-relaxed text-slate-700 space-y-5">
        {contentHtml.split('\n\n').map((para, pIdx) => {
          let paragraphNode: React.ReactNode = para;
          
          activePassage.complexSentences.forEach((cs) => {
            if (selectedSentence === cs.sentence && para.includes(cs.sentence)) {
              const parts = para.split(cs.sentence);
              paragraphNode = (
                <>
                  {parts[0]}
                  <span className="bg-indigo-50 border-b-2 border-indigo-400 font-medium transition-all duration-300 py-0.5 px-1 rounded cursor-pointer" title="Active parsed sentence">
                    {cs.sentence}
                  </span>
                  {parts[1]}
                </>
              );
            }
          });

          const currentHls = passageHighlights[activePassage.id] || [];
          if (currentHls.length > 0 && typeof paragraphNode === 'string') {
            let tempNode: React.ReactNode[] = [paragraphNode];
            currentHls.forEach((hl) => {
              const textToHighlight = hl.text;
              tempNode = tempNode.flatMap((node) => {
                if (typeof node !== 'string') return [node];
                if (!node.includes(textToHighlight)) return [node];
                
                const splitParts = node.split(textToHighlight);
                const result: React.ReactNode[] = [];
                splitParts.forEach((part, i) => {
                  result.push(part);
                  if (i < splitParts.length - 1) {
                    result.push(
                      <span key={`${hl.id}-${i}`} className="bg-amber-100/70 border-b border-amber-400 px-1 py-0.5 rounded font-sans text-slate-805">
                        {textToHighlight}
                      </span>
                    );
                  }
                });
                return result;
              });
            });
            paragraphNode = <>{tempNode}</>;
          }

          return (
            <p key={pIdx} className="mb-4 text-justify relative group line-clamp-none font-normal">
              {paragraphNode}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="gmat-portal">
      
      {/* Real GMAT Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm shrink-0" id="top-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                GMAT Focus<span className="text-indigo-650 font-bold">Prep</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Breakthrough Suite</p>
            </div>
          </div>

          {/* Area Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setNavigationTab('science')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${navigationTab === 'science' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Critical Sci-Comprehension</span>
            </button>
            <button
              onClick={() => setNavigationTab('maths')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${navigationTab === 'maths' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
            >
              <MathIcon className="w-3.5 h-3.5" />
              <span>Progressive Quant Practice</span>
            </button>
          </div>

          {/* Score tracker */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target score milestone</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">605</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, Math.max(5, ((estimatedScore - 605) / 100) * 100))}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-indigo-600">705+</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-250 hidden md:block"></div>

            <div className="flex flex-col items-end">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">ESTIMATED SCORE</div>
              <div className="text-lg font-bold text-slate-850 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-indigo-600">{estimatedScore}</span>
                <span className="text-[10px] text-slate-450 font-bold font-mono">/ 705 Goal</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Ribbon metrics */}
      <section className="bg-white border-b border-slate-200 py-3 px-6" id="stats-ribbon">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs select-none">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-indigo-550 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Verbal Passages Read</div>
              <div className="text-xs font-semibold text-slate-700">{stats.passagesRead} Active Passages</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BookMarked className="w-4 h-4 text-slate-450 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Quant Questions Solved</div>
              <div className="text-xs font-semibold text-slate-700">{totalMathQuestionsSolved} Total Solved</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-emerald-550 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Composite Accuracy</div>
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded font-mono text-[11px] bg-emerald-50 text-emerald-700 font-bold">
                  {stats.accuracy}%
                </span>
                <span className="text-[10px] text-slate-400">Target &gt; 80%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-600">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
            <p className="leading-tight text-[11px]">
              {navigationTab === 'science' 
                ? <span><strong>Strategy:</strong> Group modifiers inside nested clauses to avoid logical traps.</span>
                : <span><strong>Math Strategy:</strong> Solve rate logic by calculating task portions per unit hour.</span>
              }
            </p>
          </div>
        </div>
      </section>

      {/* Core Workspace Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 relative">
        
        {/* TAB 1: SCIENCE PASSAGE COMPREHENSION */}
        {navigationTab === 'science' && (
          <div className="space-y-6">
            
            {/* Collapsible Action Header Selector Bar (Replaced the Sidebar to make core viewport exam-like!) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                className="w-full px-6 py-3 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-bold text-xs cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>📚 STUDY SETTINGS &amp; PASSAGE ARCHIVE</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] ml-1">
                    {passages.length} available
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-normal">
                  <span>List &amp; Generate Passages</span>
                  {isSettingsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </button>

              {isSettingsExpanded && (
                <div className="p-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white animate-slide">
                  
                  {/* Passage Grid Switcher (8-cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Select Active Passage</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {passages.map((p) => {
                        const isSelected = p.id === selectedPassageId;
                        const answeredCount = p.questions.filter(q => userAnswers[q.id] !== undefined).length;
                        const isCompleted = answeredCount === p.questions.length;
                        
                        return (
                          <button
                            key={p.id}
                            onClick={() => selectPassage(p.id)}
                            className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 relative cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-205 ring-2 ring-indigo-100' : 'bg-slate-50 hover:bg-slate-100 border-slate-150'}`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${p.discipline === 'biology' ? 'text-emerald-700 bg-emerald-50' : p.discipline === 'physics' ? 'text-blue-700 bg-blue-50' : 'text-purple-700 bg-purple-50'}`}>
                                {p.discipline}
                              </span>
                              <span className="text-slate-505 font-bold">GMAT Level: {p.difficulty}</span>
                            </div>
                            <h4 className="text-xs font-bold font-serif text-slate-800 line-clamp-1">{p.title}</h4>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                              <span>{p.questions.length} Questions</span>
                              {isCompleted ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 rounded font-bold">Completed</span>
                              ) : answeredCount > 0 ? (
                                <span className="text-amber-700 bg-amber-50 px-1.5 rounded">In Progress ({answeredCount} answered)</span>
                              ) : (
                                <span className="text-slate-400 font-normal">Unread</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic compiler side (4-cols) */}
                  <div className="lg:col-span-4 bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Create custom AI passage</span>
                    </div>
                    
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Select Science Category</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['biology', 'physics', 'astronomy'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => setGenDiscipline(d)}
                            className={`py-1 rounded text-[10px] font-bold capitalize border transition-all ${genDiscipline === d ? 'bg-indigo-650 text-white border-indigo-650' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Target Difficulty Level</span>
                      <div className="grid grid-cols-4 gap-1">
                        {(['600-650', '650-700', '700-750', '750+'] as const).map(diff => (
                          <button
                            key={diff}
                            onClick={() => setGenDifficulty(diff)}
                            className={`py-1 rounded text-[9px] font-bold border transition-all ${genDifficulty === diff ? 'bg-indigo-650 text-white border-indigo-650' : 'bg-white border-slate-200 text-slate-650'}`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateNewAiPassage}
                      disabled={isGenerating}
                      className="w-full py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Generate Passage</span>
                        </>
                      )}
                    </button>

                    {generationError && (
                      <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded">
                        {generationError}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Core Split Screen Exam Center */}
            {isGenerating ? (
              <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[400px] border border-slate-200 animate-fadeIn" id="builder-loader">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                  <Brain className="w-7 h-7 text-indigo-650 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <div className="space-y-2 max-w-sm mt-3">
                  <h4 className="text-lg font-bold tracking-tight text-slate-800">Compiling 705-Level Passage</h4>
                  <p className="text-xs font-mono text-indigo-700 font-semibold h-8 select-none">{loadingStepText}</p>
                  <p className="text-xs text-slate-400 mt-2">Deducing deep scientific relationships...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col shadow-sm" id="real-exam-split">
                
                {/* Visual Title Header */}
                <div className="bg-white border-b border-indigo-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded tracking-wider">{activePassage.discipline}</span>
                      <span className="text-[10px] uppercase font-mono bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded tracking-wider">Level: {activePassage.difficulty}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-serif leading-tight">{activePassage.title}</h2>
                  </div>

                  {/* Timer & sim controllers */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-slate-50 text-slate-700 px-3 py-1 bg-white rounded-lg border border-slate-200 flex items-center gap-2 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold">{formatTime(timerSeconds)}</span>
                      <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="hover:text-amber-500 cursor-pointer text-slate-400 p-0.5">
                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button onClick={() => setTimerSeconds(0)} className="hover:text-red-500 cursor-pointer text-slate-400 p-0.5" title="Reset timer">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5">
                      <button
                        onClick={() => { setExamMode('practice'); setSelectedQuestionIndex(0); }}
                        className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${examMode === 'practice' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => { setExamMode('exam'); setSelectedQuestionIndex(0); setExamSubmitted(false); }}
                        className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${examMode === 'exam' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Exam Sim
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub Menu Ribbon */}
                <div className="border-b border-slate-100 px-6 flex justify-between items-center bg-slate-50/50">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('sim')}
                      className={`py-2 text-[10px] uppercase tracking-wider font-extrabold border-b-2 font-sans transition-all cursor-pointer ${activeTab === 'sim' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => setActiveTab('deconstruct')}
                      className={`py-2 text-[10px] uppercase tracking-wider font-extrabold border-b-2 font-sans transition-all cursor-pointer ${activeTab === 'deconstruct' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Deconstruct Tools (ELI5)
                    </button>
                    <button
                      onClick={() => setActiveTab('scratchpad')}
                      className={`py-2 text-[10px] uppercase tracking-wider font-extrabold border-b-2 font-sans transition-all cursor-pointer ${activeTab === 'scratchpad' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Scratchpad (Shorthands)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={addManualColorHighlight}
                      className="bg-white hover:bg-slate-100 text-[10px] font-bold py-1 px-2 border border-slate-200 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-650" /> Highlight Selection
                    </button>
                    {(passageHighlights[activePassage.id] || []).length > 0 && (
                      <button onClick={clearAllPassageHighlights} className="text-red-500 font-mono text-[9px] hover:underline cursor-pointer">
                        Clear ({passageHighlights[activePassage.id].length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Real exam panel grid splits (50% left for Passage, 50% right for Question Workspace) */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[480px]">
                  
                  {/* Left Column - Verbal Passage */}
                  <div className="p-6 overflow-y-auto max-h-[580px] bg-white relative">
                    <div className="text-[10px] font-mono text-slate-400 mb-2 font-bold uppercase select-none tracking-widest flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Core Exam Passage Text
                    </div>

                    <div className="select-text">
                      {renderInteractiveContent()}
                    </div>

                    {/* Highlights review */}
                    {(passageHighlights[activePassage.id] || []).length > 0 && (
                      <div className="mt-4 bg-slate-50 border border-slate-250 p-3 rounded-lg flex flex-wrap gap-1.5 select-none text-xs">
                        <span className="text-[10px] font-mono text-slate-400 block w-full uppercase font-bold">Your highlighted segments:</span>
                        {(passageHighlights[activePassage.id] || []).map(hl => (
                          <span key={hl.id} className="bg-amber-100/50 text-slate-800 border border-amber-350 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="truncate max-w-[120px] font-serif">"{hl.text}"</span>
                            <button onClick={() => removeManualHighlight(hl.id)} className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer">&times;</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Workspaces */}
                  <div className="p-6 bg-slate-50/50 overflow-y-auto max-h-[580px] flex flex-col justify-between">
                    
                    {/* QUESTIONS SUB-TAB */}
                    {activeTab === 'sim' && (() => {
                      const q: GmatQuestion = activePassage.questions[selectedQuestionIndex];
                      if (!q) return <div className="text-center text-slate-400 py-12 font-mono">No questions active.</div>;

                      const isAnswered = userAnswers[q.id] !== undefined;
                      const isSubmitted = examMode === 'practice' ? submittedQuestions[q.id] === true : examSubmitted;
                      const selectedIdx = userAnswers[q.id];
                      const isCorrect = selectedIdx === q.correctAnswerIndex;

                      return (
                        <div className="space-y-4 flex flex-col justify-between h-full">
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono select-none">
                              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">Question {selectedQuestionIndex + 1} of {activePassage.questions.length}</span>
                              <span className="text-indigo-650 font-bold">{q.questionType} • {q.subType}</span>
                            </div>

                            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                              <h4 className="text-xs font-bold leading-relaxed text-slate-805 font-sans">{q.questionText}</h4>
                            </div>

                            <div className="space-y-1.5">
                              {q.options.map((opt, oIdx) => {
                                const optionChar = String.fromCharCode(65 + oIdx);
                                const isSelected = selectedIdx === oIdx;

                                let s = "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer";
                                if (isSelected) s = "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100 font-bold";
                                if (isSubmitted) {
                                  if (oIdx === q.correctAnswerIndex) {
                                    s = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                                  } else if (isSelected) {
                                    s = "border-rose-400 bg-rose-50 text-rose-950";
                                  } else {
                                    s = "opacity-50 bg-slate-50 border-slate-100 cursor-not-allowed";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleSelectOption(selectedQuestionIndex, oIdx)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 text-xs transition-colors ${s}`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] uppercase font-mono font-bold ${isSelected ? 'bg-indigo-650 text-white border-indigo-650' : 'bg-slate-100 border-slate-300 text-slate-650'}`}>
                                      {optionChar}
                                    </span>
                                    <span className="leading-tight">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Validate feedback checks */}
                            {examMode === 'practice' && !isSubmitted && (
                              <button
                                onClick={() => submitPracticeAnswer(q)}
                                disabled={selectedIdx === undefined}
                                className="w-full py-2 bg-slate-900 border-b border-indigo-950 text-white font-bold hover:bg-slate-850 rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                              >
                                <Check className="w-4 h-4" /> Evaluate Choice
                              </button>
                            )}

                            {examMode === 'exam' && selectedQuestionIndex === activePassage.questions.length - 1 && !examSubmitted && (
                              <button
                                onClick={submitExamSuite}
                                className="w-full py-2 bg-indigo-900 text-white font-bold hover:bg-indigo-950 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                Submit Full Exam Suit
                              </button>
                            )}

                            {isSubmitted && (
                              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3 mt-1 animate-slide select-text">
                                <div className="flex items-center gap-1">
                                  {isCorrect ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Correct Answer
                                    </span>
                                  ) : (
                                    <span className="bg-rose-100 text-rose-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Trap Answer Encountered
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <strong className="text-slate-905 font-bold block">Scientific Explanation:</strong>
                                  <p className="text-slate-650 mt-0.5">{q.explanation.correct}</p>
                                </div>

                                {selectedIdx !== undefined && !isCorrect && q.explanation.incorrect[selectedIdx] && (
                                  <div className="border-l-2 border-rose-300 pl-3 text-slate-700 bg-rose-50/20 py-1.5 rounded-r">
                                    <strong className="text-rose-900 font-bold block text-[10px] uppercase font-mono">Why Your Response fails:</strong>
                                    <p className="mt-0.5 text-xs text-rose-800">{q.explanation.incorrect[selectedIdx]}</p>
                                  </div>
                                )}

                                <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-lg">
                                  <strong className="text-indigo-950 font-bold flex items-center gap-1 font-mono text-[10px] uppercase mb-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-indigo-650" /> GMAT 705 Tactical Strategy
                                  </strong>
                                  <p className="text-indigo-900 italic font-medium">{q.explanation.gmatStrategy}</p>
                                </div>
                              </div>
                            )}

                            {/* Nav footer */}
                            <div className="flex justify-between items-center border-t border-slate-200/80 pt-3 select-none">
                              <button
                                onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                                disabled={selectedQuestionIndex === 0}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                              >
                                Prev Question
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono">Question Navigator</span>
                              <button
                                onClick={() => setSelectedQuestionIndex(Math.min(activePassage.questions.length - 1, selectedQuestionIndex + 1))}
                                disabled={selectedQuestionIndex === activePassage.questions.length - 1}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                              >
                                Next Question
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })()}

                    {/* DECONSTRUCT SUB-TAB */}
                    {activeTab === 'deconstruct' && (
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-[10px] font-mono text-amber-600 uppercase tracking-widest font-bold">Vocabulary busters</h4>
                          <span className="text-[11px] text-slate-500 leading-normal block">Decipher challenging nested vocabulary and grammar skeletons instantly.</span>
                        </div>

                        {/* Terms */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Jargon Explainer (ELI5 tool)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activePassage.terms.map(t => (
                              <button
                                key={t.term}
                                onClick={() => setSelectedTerm(selectedTerm === t.term ? null : t.term)}
                                className={`py-1 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${selectedTerm === t.term ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                              >
                                {t.term}
                              </button>
                            ))}
                          </div>

                          {selectedTerm && (() => {
                            const tObj = activePassage.terms.find(t => t.term === selectedTerm);
                            if (!tObj) return null;
                            return (
                              <div className="bg-emerald-50/45 border border-emerald-100 p-3.5 rounded-xl mt-1 space-y-2 text-xs text-slate-800 font-sans animate-slide">
                                <span className="font-bold block border-b border-emerald-100 pb-1 text-slate-900">{tObj.term}</span>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-405 block uppercase">Definition:</span>
                                  <p>{tObj.definition}</p>
                                </div>
                                <div className="bg-white p-2 border border-emerald-100 rounded">
                                  <span className="text-[9px] font-extrabold text-amber-700 block uppercase">Plain English Translation:</span>
                                  <p className="italic text-slate-900 font-medium">"{tObj.plainEnglish}"</p>
                                </div>
                                <div className="bg-emerald-950/5 p-2 rounded">
                                  <span className="text-[9px] font-bold text-emerald-900 block uppercase font-mono">GMAT Focus Strategy Hint:</span>
                                  <p>{tObj.gmatTip}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Sentence analyzers */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-amber-500" /> Sentence Skeleton Analyzer
                          </span>
                          <div className="space-y-1.5">
                            {activePassage.complexSentences.map((cs, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedSentence(selectedSentence === cs.sentence ? null : cs.sentence)}
                                className={`w-full text-left p-3 rounded-lg border transition-all text-xs cursor-pointer ${selectedSentence === cs.sentence ? 'bg-amber-50 border-amber-400 text-slate-900 font-bold' : 'bg-slate-50 hover:bg-slate-100'}`}
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase">Sentence {idx + 1}:</span>
                                <span className="italic">"{cs.sentence}"</span>
                              </button>
                            ))}
                          </div>

                          {selectedSentence && (() => {
                            const sObj = activePassage.complexSentences.find(s => s.sentence === selectedSentence);
                            if (!sObj) return null;
                            return (
                              <div className="bg-amber-50/40 border border-amber-250 p-3 rounded-xl space-y-2 text-xs text-slate-805 animate-slide">
                                <div className="bg-white p-2 rounded border border-amber-200">
                                  <span className="text-[9px] font-bold text-slate-450 block uppercase mb-0.5">English Translation:</span>
                                  <p className="font-semibold text-slate-950">"{sObj.simplified}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                  <div className="bg-slate-100 p-2 rounded">
                                    <span className="text-[8px] text-slate-400 uppercase font-bold block">Subject:</span>
                                    <span className="text-slate-800 font-bold font-mono">{sObj.subject}</span>
                                  </div>
                                  <div className="bg-slate-100 p-2 rounded">
                                    <span className="text-[8px] text-slate-400 uppercase font-bold block">Verb:</span>
                                    <span className="text-slate-800 font-bold font-mono">{sObj.mainVerb}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Clause Modifiers breakdown:</span>
                                  <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-slate-600">
                                    {sObj.modifiers.map((m, mIdx) => (
                                      <li key={mIdx}>{m}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* SCRATCHPAD SUB-TAB */}
                    {activeTab === 'scratchpad' && (
                      <div className="space-y-4 flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-widest">Active Structure Mapping</span>
                          <span className="text-xs text-slate-505 block">Write incredibly concise 1-sentence outlines for each paragraph to sustain concentration under exam speed counts!</span>
                          
                          <textarea
                            value={scratchpadText[activePassage.id] || ''}
                            onChange={(e) => setScratchpadText({
                              ...scratchpadText,
                              [activePassage.id]: e.target.value
                            })}
                            placeholder="Example Structural map:&#10;P1: Endosymbiosis benefits archaeon host (increased ATP efficiency).&#10;P2: Danger of ROS mutagenic byproduct catalyzes nuclear shield.&#10;Primary Purpose: Explaining nucleus necessity as biological protectant."
                            rows={8}
                            className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none flex-1"
                          />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-slate-655 space-y-1 mt-auto">
                          <strong className="text-slate-900 block font-bold font-mono text-[10px] uppercase">Roadmapping strategy checklist:</strong>
                          <p>1. Skip minor adjectives. Target nouns and active mechanisms.</p>
                          <p>2. Keep it under 20-30 seconds to spare time for options evaluation.</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: PROGRESSIVE QUANT PRACTICE (MATHS) */}
        {navigationTab === 'maths' && (
          <div className="space-y-6">
            
            {/* Topic Progress Meters list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {([
                'algebra', 
                'arithmetic', 
                'word-problems', 
                'number-properties', 
                'rates-and-work', 
                'ratios-and-percents', 
                'statistics-and-data'
              ] as const).map(topic => {
                const isActive = activeMathTopic === topic;
                const solved = mathCompletedCounts[topic] || 0;
                const target = 50; // 40-50 questions target as requested by user
                const percentage = Math.min(100, (solved / target) * 100);

                return (
                  <button
                    key={topic}
                    onClick={() => {
                      setActiveMathTopic(topic);
                      setMathSelectedAnswer(null);
                      setMathAnswerSubmitted(false);
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${isActive ? 'bg-white border-indigo-650 ring-2 ring-indigo-50 shadow-sm' : 'bg-white hover:bg-slate-100 border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                      <span className="truncate max-w-[120px]">{topic.replace(/-/g, ' ')}</span>
                      {percentage >= 100 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded-full text-[9px] shrink-0">Finished</span>
                      ) : (
                        <span className="text-slate-400 shrink-0">{solved}/{target} done</span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-800 leading-none capitalize mb-2 truncate">
                      {topic.replace(/-/g, ' ')}
                    </h3>

                    {/* Completion progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Solved Adjuster buttons */}
                    <div className="flex justify-between items-center text-[11px]" onClick={e => e.stopPropagation()}>
                      <span className="text-slate-400 font-bold font-mono">{percentage.toFixed(0)}% Complete</span>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                        <button onClick={() => updateMathCount(topic, -1)} className="hover:text-red-600 px-0.5 text-[10px] font-bold">-</button>
                        <span className="font-semibold text-slate-700 font-mono px-1">{solved}</span>
                        <button onClick={() => updateMathCount(topic, 1)} className="hover:text-emerald-700 px-0.5 text-[10px] font-bold">+</button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Maths Question Board Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              
              {/* Left Column: Topic stats, Difficulty selections (4-cols) */}
              <div className="md:col-span-4 p-6 bg-slate-50/40 space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-mono text-slate-455 font-bold tracking-widest block">ACTIVE STUDY TOPIC</span>
                    <h3 className="text-lg font-bold text-slate-900 capitalize font-display leading-tight">{activeMathTopic.replace(/-/g, ' ')}</h3>
                    <p className="text-xs text-slate-550 leading-relaxed">
                      Conforming strictly to the <strong>GMAT Focus Edition</strong> syllabus (all arithmetic and algebraic concepts, absolutely <em>no geometry</em>). Master core problem structures to secure a high-percentile breakthrough!
                    </p>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Difficulty level selector */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-mono text-slate-455 font-bold tracking-widest block">MATH DIFFICULTY FILTER</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['easy', 'medium', 'hard'] as const).map(diff => {
                        const isChosen = mathDifficulty === diff;
                        return (
                          <button
                            key={diff}
                            onClick={() => {
                              setMathDifficulty(diff);
                              // Smart catalog switching inside current active math topic
                              const list = topicMathQuestions[activeMathTopic] || [];
                              const matchedIdx = list.findIndex(q => q.difficulty === diff);
                              if (matchedIdx !== -1) {
                                setActiveMathQuestionIndex({
                                  ...activeMathQuestionIndex,
                                  [activeMathTopic]: matchedIdx
                                });
                              } else {
                                // Try finding a baseline matching topic & difficulty
                                const baselineMatchIdx = mockMathQuestions.findIndex(q => q.topic === activeMathTopic && q.difficulty === diff);
                                if (baselineMatchIdx !== -1) {
                                  const matchingQ = mockMathQuestions[baselineMatchIdx];
                                  const updatedCatalog = { ...topicMathQuestions };
                                  if (!updatedCatalog[activeMathTopic]) updatedCatalog[activeMathTopic] = [];
                                  if (!updatedCatalog[activeMathTopic].some(x => x.id === matchingQ.id)) {
                                    updatedCatalog[activeMathTopic] = [...updatedCatalog[activeMathTopic], matchingQ];
                                    localStorage.setItem('gmat_math_catalog', JSON.stringify(updatedCatalog));
                                    setTopicMathQuestions(updatedCatalog);
                                  }
                                  const newIdx = updatedCatalog[activeMathTopic].findIndex(x => x.id === matchingQ.id);
                                  setActiveMathQuestionIndex({
                                    ...activeMathQuestionIndex,
                                    [activeMathTopic]: newIdx !== -1 ? newIdx : updatedCatalog[activeMathTopic].length - 1
                                  });
                                }
                              }
                              setMathSelectedAnswer(null);
                              setMathAnswerSubmitted(false);
                            }}
                            className={`py-2 px-1 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${isChosen ? 'bg-indigo-650 text-white border-indigo-650 shadow-sm ring-2 ring-indigo-50 font-bold' : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-100'}`}
                          >
                            <span className="text-[11px] uppercase tracking-wide block font-extrabold">{diff}</span>
                            <span className={`text-[9px] font-mono block ${isChosen ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {mathDifficultySolved[diff]} solved
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Manual Difficulty counters adjuster */}
                    <div className="flex items-center justify-between text-[10px] bg-white p-2 rounded-xl border border-slate-200/60 select-none">
                      <span className="text-slate-450 font-mono font-bold uppercase tracking-wider text-[8px]">ADJUST {mathDifficulty}:</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                          <button 
                            onClick={() => updateMathDifficultyCount(mathDifficulty, -1)} 
                            className="hover:text-red-650 px-1 font-bold text-[10px] cursor-pointer"
                            title={`Decrease ${mathDifficulty} solved count`}
                          >-</button>
                          <span className="font-bold text-slate-800 font-mono px-1.5">{mathDifficultySolved[mathDifficulty]}</span>
                          <button 
                            onClick={() => updateMathDifficultyCount(mathDifficulty, 1)} 
                            className="hover:text-emerald-700 px-1 font-bold text-[10px] cursor-pointer"
                            title={`Increase ${mathDifficulty} solved count`}
                          >+</button>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 leading-normal block italic">Highly recommended: complete 40+ easy and medium before scaling hard breakout. Solved questions update counts automatically.</span>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Caching / Cost explanation cards */}
                  <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 space-y-2 text-xs text-slate-655 font-mono">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[10px] uppercase tracking-wide">
                      <BookOpenCheck className="w-4 h-4 text-indigo-700" />
                      Efficient caching model
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      We locally cache your practicing questions and answers to save Gemini API costs! Click <strong>"Generate Dynamic Math Question"</strong> to fetch a brand-new customized problem, or click <strong>"Practice Another Baseline Question"</strong> to cycle baseline questions instantly for free!
                    </p>
                  </div>
                </div>

                <div className="pt-4 select-none">
                  <span className="text-[10px] block text-slate-400 font-mono uppercase font-bold mb-1">COMPLETION FORECAST</span>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Topic Progress:</span>
                    <span>{mathCompletedCounts[activeMathTopic]} / 50 Resolved</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(100, ((mathCompletedCounts[activeMathTopic] || 0) / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Right Column: Problem Solving Canvas (8-cols) */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between">
                
                {isGeneratingMath ? (
                  <div className="py-24 text-center space-y-3 flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                      <Brain className="w-5 h-5 text-indigo-650 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-805 font-mono">Synthesizing Fresh Quant Question...</h4>
                      <p className="text-xs text-slate-450 uppercase tracking-widest font-mono">Model: Gemini 3.5 Flash</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 h-full flex flex-col justify-between">
                    
                    <div className="space-y-4">
                      
                      {/* Section header info */}
                      <div className="flex justify-between items-center text-[10px] font-mono select-none border-b border-slate-100 pb-2.5">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
                          GMAT PROBLEM SOLVING • {activeMathTopic.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Source: <strong className="text-slate-800 uppercase text-[11px]">{currentMathQ.id.startsWith('math-') ? 'Local Baseline' : 'Gemini AI'}</strong></span>
                          <span className="bg-slate-205 text-slate-700 px-2 py-0.5 rounded uppercase font-bold">Difficulty: {currentMathQ.difficulty}</span>
                        </div>
                      </div>

                      {/* Math Question Text */}
                      <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-sm">
                        <h4 className="text-sm font-bold leading-relaxed text-slate-805 font-sans font-medium text-justify">
                          {currentMathQ.questionText}
                        </h4>
                      </div>

                      {/* Math option selectors */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {currentMathQ.options.map((optionText, oIdx) => {
                          const optionChar = String.fromCharCode(65 + oIdx);
                          const isSelected = mathSelectedAnswer === oIdx;

                          let s = "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer";
                          if (isSelected) s = "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100 font-bold";
                          if (mathAnswerSubmitted) {
                            if (oIdx === currentMathQ.correctAnswerIndex) {
                              s = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                            } else if (isSelected) {
                              s = "border-rose-400 bg-rose-50 text-rose-950";
                            } else {
                              s = "opacity-50 bg-slate-55 border-slate-100 cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                if (mathAnswerSubmitted) return;
                                setMathSelectedAnswer(oIdx);
                              }}
                              disabled={mathAnswerSubmitted}
                              className={`text-left p-3 rounded-lg border flex items-start gap-3 text-xs transition-colors ${s}`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] uppercase font-mono font-bold ${isSelected ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-100 border-slate-300 text-slate-650'}`}>
                                {optionChar}
                              </span>
                              <span className="leading-tight">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Evaluator trigger */}
                      {!mathAnswerSubmitted && (
                        <button
                          onClick={submitMathAnswer}
                          disabled={mathSelectedAnswer === null}
                          className="w-full py-2 bg-slate-900 border-b border-indigo-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Evaluate Math Choice
                        </button>
                      )}

                    </div>

                    {/* Explanations drawer */}
                    <div className="space-y-4 pt-4">
                      
                      {mathError && (
                        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{mathError}</span>
                        </div>
                      )}

                      {mathAnswerSubmitted && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3.5 animate-slide select-text">
                          <div className="flex items-center gap-1">
                            {mathSelectedAnswer === currentMathQ.correctAnswerIndex ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Correct Solution: +1 Solved Counted
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Incorrect Solution
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <strong className="text-slate-905 font-bold block">Definitive Explanation:</strong>
                            <p className="text-slate-650 leading-relaxed font-sans">{parseSimpleMarkdown(currentMathQ.explanation)}</p>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-900">
                            <strong className="text-indigo-950 font-bold block font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 mb-1">
                              <Lightbulb className="w-3.5 h-3.5 text-indigo-650" />
                              GMAT Shortcut Option Strategy
                            </strong>
                            <p className="italic">{parseSimpleMarkdown(currentMathQ.strategy || "")}</p>
                          </div>
                        </div>
                      )}

                      {/* Next Question primary action when evaluated */}
                      {mathAnswerSubmitted && (
                        <div className="mt-4 animate-slide">
                          <button
                            onClick={goToNextMathQuestion}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer animate-pulse"
                          >
                            <span>Advance to Next {mathDifficulty} Question</span>
                            <ArrowRight className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}

                      {/* Dynamic Controllers Block (Generate Question, Next baseline, complete mark) */}
                      <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-205/80 pt-4">
                        <button
                          onClick={generateNewMathQuestion}
                          disabled={isGeneratingMath}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>🔄 Generate Dynamic Math Question</span>
                        </button>
                        
                        <button
                          onClick={cycleNextLocalMathQuestion}
                          className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Practice baseline Question</span>
                        </button>

                        {currentTopicQuestions.length > 1 && (
                          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-lg select-none">
                            <button onClick={cyclePrevMathQuestion} className="hover:bg-white text-[10px] font-serif font-bold px-2.5 py-1 rounded transition-all text-slate-650 cursor-pointer">
                              &lt; Back
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ---------------- CHATBOT SLIDING DRAWER CONTROL SIDEBAR ---------------- */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-indigo-500 animate-bounce"
        >
          <MessageSquare className="w-5 h-5 text-white animate-pulse" />
          <span>💬 Ask AI Tutor</span>
          {isChatOpen ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />}
        </button>
      </div>

      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-250 shadow-2xl z-50 flex flex-col justify-between animate-slide">
          
          {/* Chat header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center select-none">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider">AI TUTOR CONTEXT CORE</h3>
                <span className="text-[10px] text-indigo-200 uppercase font-mono tracking-widest block font-bold">Score Lift Forecast: 705 Breakthrough</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer focus:outline-none p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model selection & Context tag */}
          <div className="bg-slate-50 border-b border-slate-200 p-3.5 space-y-3 shrink-0">
            <div className="flex justify-between items-center select-none">
              <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest font-mono">TUTOR MODALITY</span>
              <div className="bg-slate-205 p-0.5 rounded-lg flex gap-0.5 font-mono text-[9px]">
                <button
                  onClick={() => setChatType('gemini')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${chatType === 'gemini' ? 'bg-indigo-600 text-white' : 'text-slate-550 hover:text-slate-850'}`}
                >
                  🛰️ Gemini Core
                </button>
                <button
                  onClick={() => setChatType('search')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${chatType === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-550 hover:text-slate-850'}`}
                >
                  🔍 Web Grounding
                </button>
              </div>
            </div>

            {/* Context auto pre-loader indicator */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-655 font-mono space-y-1 select-none">
              <span className="text-[9px] text-indigo-700 font-extrabold uppercase block font-mono">⚡ Preloaded Doubt Context</span>
              {navigationTab === 'science' ? (
                <div className="flex items-center gap-1 text-slate-800 font-medium">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Science Passage: "{activePassage.title}"</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-805 font-medium">
                  <MathIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Active Quant Topic: "{activeMathTopic.replace('-', ' ')}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 select-text">
            {chatHistory.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm border ${isUser ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <span className="block text-[8px] uppercase font-mono mb-1 font-bold text-slate-400 select-none">
                      {isUser ? 'My doubt' : 'AI Tutor'}
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed font-sans">{parseSimpleMarkdown(m.text)}</p>

                    {/* Grounding references links */}
                    {m.links && m.links.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[10px] select-none text-slate-500 font-mono">
                        <div className="flex items-center gap-1 text-indigo-700 font-bold uppercase tracking-wider mb-1">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" /> Grounded Search References:
                        </div>
                        {m.links.map((lnk, lIdx) => (
                          <a
                            key={lIdx}
                            href={lnk.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-indigo-600 hover:text-indigo-805 hover:underline truncate"
                          >
                            &bull; {lnk.title || lnk.uri}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSendingChat && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-150 rounded-2xl p-3 text-xs shadow-sm text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                  <span>Tutor is formulating explanation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'ENTER' || e.key === 'Enter') sendChatMessage(); }}
              placeholder={chatType === 'search' ? "Search GMAT tricks or rules on Google..." : "Ask Gemini about nuclear compartmentalization..."}
              className="flex-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={sendChatMessage}
              disabled={isSendingChat || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-750 text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Footer */}
      <footer className="bg-white text-slate-500 border-t border-slate-100 py-6 mt-12 px-6 text-center text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left font-sans">
            <span className="font-semibold text-slate-800 text-sm block tracking-wide">GMAT Focus Breakthrough</span>
            <span className="text-slate-400 text-[11px]">Supporting GMAT candidates to raise their percentiles with advanced modifier mechanics and customized math workouts.</span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            Connected with Google AI Studio &bull; Powered by Gemini 3.5 Flash &amp; Google Grounding
          </div>
        </div>
      </footer>

    </div>
  );
}
