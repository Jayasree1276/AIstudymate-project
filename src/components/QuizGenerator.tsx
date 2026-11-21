import React, { useState } from 'react';
import { Subject, Quiz, QuizQuestion, QuizResult } from '../types';
import { 
  HelpCircle, 
  Sparkles, 
  Award, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  BrainCircuit, 
  Loader2, 
  Trash2, 
  BookOpen, 
  Lightbulb,
  Clock,
  Check,
  Zap,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { getSubjectColorClasses } from '../utils/theme';

interface QuizGeneratorProps {
  subjects: Subject[];
  quizzes: Quiz[];
  quizResults: QuizResult[];
  onSaveQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onSaveQuizResult: (result: QuizResult) => void;
  initialSubject?: Subject | null;
  initialTopic?: string;
  initialNoteContent?: string;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  subjects,
  quizzes,
  quizResults,
  onSaveQuiz,
  onDeleteQuiz,
  onSaveQuizResult,
  initialSubject,
  initialTopic = '',
  initialNoteContent = '',
}) => {
  // Generation state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubject ? initialSubject.id : subjects[0]?.id || ''
  );
  const [topic, setTopic] = useState<string>(initialTopic);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [noteContent, setNoteContent] = useState<string>(initialNoteContent);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(quizzes[0] || null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [completedResult, setCompletedResult] = useState<QuizResult | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      setIsGenerating(true);
      const res = await api.generateAIQuiz({
        subject: `${selectedSubject.code}: ${selectedSubject.name}`,
        topic: topic.trim() || selectedSubject.topics[0] || 'Core Subject Concepts',
        noteContent: noteContent.trim() || undefined,
        questionCount,
        difficulty,
      });

      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        subjectId: selectedSubject.id,
        topic: topic.trim() || selectedSubject.topics[0] || 'Core Concepts',
        quizTitle: res.quizTitle || `${selectedSubject.code} Revision Quiz`,
        description: res.description,
        difficulty: res.difficulty || difficulty,
        questions: res.questions.map((q, idx) => ({
          id: `q-${Date.now()}-${idx}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          hint: q.hint,
        })),
        createdAt: new Date().toISOString(),
      };

      onSaveQuiz(newQuiz);
      startQuiz(newQuiz);
    } catch (err: any) {
      alert(`AI Quiz Generator Error: ${err.message || 'Failed to generate quiz'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setShowHint(false);
    setIsFinished(false);
    setCompletedResult(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    const answersRecord = activeQuiz.questions.map((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        selectedIndex: selected !== undefined ? selected : -1,
        isCorrect,
      };
    });

    const total = activeQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const result: QuizResult = {
      id: `res-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.quizTitle,
      subjectName: selectedSubject?.name || 'Academic Course',
      score,
      totalQuestions: total,
      percentage,
      answers: answersRecord,
      completedAt: new Date().toISOString(),
    };

    onSaveQuizResult(result);
    setCompletedResult(result);
    setIsFinished(true);

    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const currentQ = activeQuiz?.questions[currentQuestionIdx];
  const isCurrentAnswered = currentQ ? selectedAnswers[currentQ.id] !== undefined : false;
  const isLastQuestion = activeQuiz ? currentQuestionIdx === activeQuiz.questions.length - 1 : false;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-violet-600" />
            AI Quiz & Active Recall Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Strengthen neural connections with automated multiple-choice tests, instant explanations, and scoring metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-violet-50 text-violet-800 border border-violet-200 rounded-xl">
            {quizzes.length} Quizzes Available
          </span>
        </div>
      </div>

      {/* Main Grid: Quiz Creator & Library (Left 5 Cols) vs Active Test Arena (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Creator & Library (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Creator Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">Generate Custom AI Quiz</h3>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-3.5 text-xs">
              
              {/* Subject */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Course / Subject *</label>
                <select
                  required
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Specific Topic or Concept *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dijkstra, Eigenvalues, Carbonyl Reactions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              {/* Question Count & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Questions Count</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value={3}>3 Quick Recall</option>
                    <option value={5}>5 Standard Test</option>
                    <option value={10}>10 In-Depth Exam</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="Easy">Easy (Definitions & Basics)</option>
                    <option value="Medium">Medium (Application & Mechanics)</option>
                    <option value="Hard">Hard (Edge Cases & Tricky Concepts)</option>
                  </select>
                </div>
              </div>

              {/* Optional Note Source */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Optional Notes Material Context</label>
                <textarea
                  rows={2}
                  placeholder="Paste lecture excerpts or formulas here to generate questions specifically from your notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <button
                id="btn-generate-quiz"
                type="submit"
                disabled={isGenerating || !selectedSubjectId}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Quiz with Gemini 3.7...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create AI Revision Test</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Saved Quizzes Library */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Saved Quizzes Library ({quizzes.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {quizzes.map((q) => {
                const sub = subjects.find((s) => s.id === q.subjectId);
                const colors = getSubjectColorClasses(sub?.color || 'slate');
                const isCurrent = activeQuiz?.id === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => startQuiz(q)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-violet-50 border-violet-300 font-bold text-violet-950 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {sub && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${colors.badge}`}>
                            {sub.code}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-semibold">{q.difficulty}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 truncate mt-0.5 max-w-[220px]">
                        {q.quizTitle}
                      </h4>
                      <p className="text-[10px] text-slate-400">{q.questions.length} questions</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this quiz?')) onDeleteQuiz(q.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="p-1 rounded-md bg-white border border-slate-200 text-violet-600">
                        <Play className="w-3.5 h-3.5 fill-violet-600" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Interactive Active Quiz Arena (7 Cols) */}
        <div className="lg:col-span-7">
          
          {activeQuiz ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {!isFinished && currentQ ? (
                <>
                  {/* Active Test Header & Progress Bar */}
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-violet-100 text-violet-800 rounded-md">
                          {activeQuiz.difficulty} Difficulty
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">
                          {activeQuiz.quizTitle}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIdx + (isCurrentAnswered ? 1 : 0)) / activeQuiz.questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                      {currentQ.question}
                    </h4>

                    {/* Options (4 buttons) */}
                    <div className="space-y-2.5">
                      {currentQ.options.map((option, oIdx) => {
                        const isSelected = selectedAnswers[currentQ.id] === oIdx;
                        const isCorrect = currentQ.correctIndex === oIdx;
                        
                        let optionStyle = 'border-slate-200 hover:border-violet-300 bg-slate-50/50 text-slate-800';
                        if (isCurrentAnswered) {
                          if (isCorrect) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                          } else {
                            optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-violet-600 bg-violet-50 text-violet-950 font-bold';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(currentQ.id, oIdx)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{option}</span>
                            </div>

                            {isCurrentAnswered && (
                              <div className="shrink-0">
                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Immediate Explanation Card after answering */}
                  {isCurrentAnswered && (
                    <div className={`p-4 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                      selectedAnswers[currentQ.id] === currentQ.correctIndex 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {selectedAnswers[currentQ.id] === currentQ.correctIndex ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! Excellent Recall.</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Review Required:</span>
                          </>
                        )}
                      </div>
                      <p className="leading-relaxed text-[11px] sm:text-xs">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}

                  {/* Question Controls & Hint */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {currentQ.hint ? (
                      <div>
                        {showHint ? (
                          <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            💡 Hint: {currentQ.hint}
                          </p>
                        ) : (
                          <button
                            onClick={() => setShowHint(true)}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            Show Hint
                          </button>
                        )}
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      {isLastQuestion ? (
                        <button
                          onClick={handleFinishQuiz}
                          disabled={!isCurrentAnswered}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                          Finish Quiz & See Score
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentQuestionIdx((prev) => prev + 1);
                            setShowHint(false);
                          }}
                          disabled={!isCurrentAnswered}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
                        >
                          <span>Next Question</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </>
              ) : (
                /* Results Screen */
                completedResult && (
                  <div className="space-y-6 text-center py-4">
                    
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30">
                      <Award className="w-8 h-8 text-amber-300" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        Quiz Completed!
                      </h3>
                      <p className="text-xs text-slate-500">{activeQuiz.quizTitle}</p>
                    </div>

                    {/* Score Badges */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-[110px]">
                        <span className="text-[11px] text-slate-400 block font-medium">Final Score</span>
                        <span className="text-2xl font-extrabold text-slate-900">
                          {completedResult.score} / {completedResult.totalQuestions}
                        </span>
                      </div>

                      <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 min-w-[110px]">
                        <span className="text-[11px] text-violet-700 block font-medium">Accuracy</span>
                        <span className="text-2xl font-extrabold text-violet-900">
                          {completedResult.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Feedback advice */}
                    <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                      {completedResult.percentage >= 80 ? (
                        <p className="text-emerald-800 font-semibold">
                          🎉 Outstanding mastery! You have a solid grasp of this topic.
                        </p>
                      ) : completedResult.percentage >= 60 ? (
                        <p className="text-amber-800 font-semibold">
                          👍 Good effort! Review the questions you missed below to reinforce weak spots.
                        </p>
                      ) : (
                        <p className="text-rose-800 font-semibold">
                          💡 Suggestion: Review the lecture notes and ask the Socratic AI Tutor for concept breakdowns before retrying.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => startQuiz(activeQuiz)}
                        className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </button>

                      <button
                        onClick={() => {
                          // Jump to another quiz
                          const nextQ = quizzes.find((q) => q.id !== activeQuiz.id);
                          if (nextQ) startQuiz(nextQ);
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-xs"
                      >
                        Try Another Quiz
                      </button>
                    </div>

                  </div>
                )
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">Select or Generate a Quiz</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the AI Generator on the left to create practice tests on your course topics or notes.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
