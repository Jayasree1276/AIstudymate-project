import React, { useState } from 'react';
import { Subject, StudyPlan, StudyPlanItem, StudySchedule } from '../types';
import { 
  Sparkles, 
  BrainCircuit, 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle2, 
  Loader2, 
  Play, 
  Layers, 
  Zap, 
  ChevronRight,
  BookOpen,
  Trash2,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { getSubjectColorClasses } from '../utils/theme';

interface StudyPlanGeneratorProps {
  subjects: Subject[];
  studyPlans: StudyPlan[];
  onSaveStudyPlan: (plan: StudyPlan) => void;
  onDeleteStudyPlan: (id: string) => void;
  onApplyPlanToSchedules: (schedules: StudySchedule[]) => void;
  initialSubject?: Subject | null;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({
  subjects,
  studyPlans,
  onSaveStudyPlan,
  onDeleteStudyPlan,
  onApplyPlanToSchedules,
  initialSubject,
}) => {
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    initialSubject ? [initialSubject.id] : subjects.map((s) => s.id)
  );
  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [availableHours, setAvailableHours] = useState<number>(3);
  const [preferredStyle, setPreferredStyle] = useState<string>('Balanced (Theory + Active Practice + Quizzes)');
  const [currentLevel, setCurrentLevel] = useState<string>('Intermediate (Need solid practice on tough topics)');
  const [focusAreas, setFocusAreas] = useState<string>('Core exam topics, formulas, problem solving');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(studyPlans[0] || null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) return;

    try {
      setIsGenerating(true);
      const chosenSubjects = subjects.filter((s) => selectedSubjectIds.includes(s.id));

      const payload = {
        subjects: chosenSubjects.map((s) => ({
          name: s.name,
          code: s.code,
          topics: s.topics,
          examDate: s.examDate,
          masteryPercent: s.masteryPercent,
        })),
        examDate,
        availableHoursPerDay: availableHours,
        preferredStyle,
        currentLevel,
        focusAreas,
      };

      const result = await api.generateAIStudyPlan(payload);

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        title: result.title || `Mastery Plan for ${chosenSubjects.map((s) => s.code).join(', ')}`,
        overview: result.overview,
        strategyTips: result.strategyTips || [],
        dailyTargetHours: result.dailyTargetHours || availableHours,
        weeklyMilestones: result.weeklyMilestones || [],
        schedule: result.schedule || [],
        createdAt: new Date().toISOString(),
      };

      onSaveStudyPlan(newPlan);
      setCurrentPlan(newPlan);
    } catch (err: any) {
      alert(`AI Study Plan Error: ${err.message || 'Failed to generate study plan'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToSchedule = () => {
    if (!currentPlan || !currentPlan.schedule) return;

    const baseDate = new Date();
    const newSchedules: StudySchedule[] = currentPlan.schedule.map((item, idx) => {
      const targetDate = new Date(baseDate.getTime() + idx * 24 * 60 * 60 * 1000);
      const subjectMatch = subjects.find(
        (s) => s.code.toLowerCase() === item.subject.toLowerCase() || s.name.toLowerCase() === item.subject.toLowerCase()
      ) || subjects[0];

      return {
        id: `sch-${Date.now()}-${idx}`,
        subjectId: subjectMatch?.id || subjects[0]?.id || 'sub-general',
        title: `${item.topic} (${item.sessionType})`,
        date: targetDate.toISOString().split('T')[0],
        startTime: '10:00',
        durationMinutes: item.durationMinutes || 60,
        sessionType: item.sessionType as any,
        isCompleted: false,
        actionItems: item.actionItems,
        notes: `AI Study Plan: Day ${idx + 1}`,
      };
    });

    onApplyPlanToSchedules(newSchedules);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Personalized Study Plan Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gemini 3.7 synthesizes your syllabus, target exam dates, and daily study capacity into an adaptive revision timetable.
          </p>
        </div>

        {currentPlan && (
          <button
            onClick={handleApplyToSchedule}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>{appliedSuccess ? 'Added to Timetable!' : 'Sync to Calendar Schedule'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Form Inputs (Left 5 Cols) & Plan Output (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Study Plan Parameters</h3>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4 text-xs">
            
            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block">
                Select Subjects to Include *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  const colors = getSubjectColorClasses(sub.color);
                  return (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs' 
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mr-1.5 ${colors.badge}`}>
                          {sub.code}
                        </span>
                        <span className="text-xs truncate">{sub.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Exam Date & Daily Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Exam Date *</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Daily Study Capacity</label>
                <select
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={1.5}>1.5 Hours / Day (Light)</option>
                  <option value={3}>3 Hours / Day (Moderate)</option>
                  <option value={4.5}>4.5 Hours / Day (Intensive)</option>
                  <option value={6}>6+ Hours / Day (Deep Immersion)</option>
                </select>
              </div>
            </div>

            {/* Learning Style */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Preferred Learning Strategy</label>
              <select
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Balanced (Theory + Active Practice + Quizzes)">Balanced (Theory + Active Recall + Quizzes)</option>
                <option value="Problem-Solving & Coding Heavy">Problem-Solving & Practice Questions Heavy</option>
                <option value="Rapid Revision & High-Yield Cramming">Rapid High-Yield Revision & Flashcards</option>
                <option value="Deep Conceptual & Derivation Focus">Deep Conceptual Foundations & Proofs</option>
              </select>
            </div>

            {/* Student Current Level */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Your Current Level / Confidence</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Beginner (Need step-by-step foundation)">Beginner (Need step-by-step fundamentals first)</option>
                <option value="Intermediate (Good grasp, need speed & practice)">Intermediate (Solid basics, need problem speed)</option>
                <option value="Advanced (Targeting A+ perfection & mock exams)">Advanced (Aiming for top grade & mock exams)</option>
              </select>
            </div>

            {/* Weak topics / Special Focus */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Weak Topics or Special Focus Areas</label>
              <textarea
                rows={2}
                placeholder="e.g. Dynamic programming edge cases, Grignard mechanisms..."
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              id="btn-generate-study-plan"
              type="submit"
              disabled={isGenerating || selectedSubjectIds.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini 3.7 is Generating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Study Timetable</span>
                </>
              )}
            </button>

          </form>

          {/* Past Generated Plans History */}
          {studyPlans.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Saved Study Plans ({studyPlans.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {studyPlans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setCurrentPlan(p)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                      currentPlan?.id === p.id 
                        ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{p.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStudyPlan(p.id);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Plan Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {currentPlan ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-violet-100 text-violet-800 rounded-md">
                    Active Study Roadmap
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {currentPlan.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: {currentPlan.dailyTargetHours} hrs/day • Created {new Date(currentPlan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={handleApplyToSchedule}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{appliedSuccess ? 'Scheduled!' : 'Schedule All Sessions'}</span>
                </button>
              </div>

              {/* Strategic Overview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Strategy & Methodology
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentPlan.overview}
                </p>
              </div>

              {/* Strategy Tips */}
              {currentPlan.strategyTips && currentPlan.strategyTips.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">
                    High-Yield Exam Tips
                  </h4>
                  <ul className="space-y-1 text-xs text-indigo-950/90">
                    {currentPlan.strategyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Milestones */}
              {currentPlan.weeklyMilestones && currentPlan.weeklyMilestones.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Weekly Roadmap & Target Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentPlan.weeklyMilestones.map((m, mIdx) => (
                      <div key={mIdx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            W{m.weekNumber}
                          </span>
                          <span>{m.theme}</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
                          {m.goals.map((g, gIdx) => (
                            <li key={gIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-by-Day Detailed Schedule */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Daily Action Schedule ({currentPlan.schedule?.length || 0} Sessions)
                </h4>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {currentPlan.schedule?.map((item: StudyPlanItem, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-2xs transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold">
                            {item.day}
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {item.subject}: {item.topic}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg shrink-0">
                          {item.durationMinutes} mins
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Type:</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                          {item.sessionType}
                        </span>
                      </div>

                      {item.actionItems && item.actionItems.length > 0 && (
                        <div className="bg-slate-50/80 p-2.5 rounded-lg text-[11px] space-y-1">
                          <span className="font-semibold text-slate-700 block">Action Checklist:</span>
                          {item.actionItems.map((act, aIdx) => (
                            <p key={aIdx} className="text-slate-600 flex items-start gap-1.5">
                              <span className="text-indigo-500 font-bold">→</span>
                              <span>{act}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">Ready to Create Your Study Timetable</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your subject topics, exam date, and daily study capacity on the left to generate an AI study roadmap.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
