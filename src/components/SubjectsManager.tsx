import React, { useState } from 'react';
import { Subject, SubjectColor } from '../types';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  UserCheck, 
  Target, 
  Trash2, 
  Edit3, 
  Sparkles, 
  HelpCircle, 
  Play, 
  Check, 
  PlusCircle, 
  Award,
  X
} from 'lucide-react';
import { getSubjectColorClasses, formatDaysRemaining } from '../utils/theme';

interface SubjectsManagerProps {
  subjects: Subject[];
  onSaveSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onOpenTimerForSubject: (subjectId: string, topic?: string) => void;
  onGenerateQuizForSubject: (subject: Subject) => void;
  onGeneratePlanForSubject: (subject: Subject) => void;
}

const AVAILABLE_COLORS: SubjectColor[] = [
  'emerald', 'indigo', 'amber', 'rose', 'violet', 'cyan', 'blue', 'fuchsia'
];

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  onSaveSubject,
  onDeleteSubject,
  onOpenTimerForSubject,
  onGenerateQuizForSubject,
  onGeneratePlanForSubject,
}) => {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState<{ [subjectId: string]: string }>({});

  const handleOpenAdd = () => {
    setEditingSubject({
      id: `sub-${Date.now()}`,
      code: '',
      name: '',
      instructor: '',
      color: 'indigo',
      targetGrade: '',
      creditHours: 3,
      examDate: '',
      topics: [],
      masteryPercent: 0,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject({ ...subject });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.code || !editingSubject.name) return;
    onSaveSubject(editingSubject);
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleAddTopic = (subject: Subject) => {
    const input = newTopicInput[subject.id]?.trim();
    if (!input) return;
    const updatedTopics = [...subject.topics, input];
    onSaveSubject({
      ...subject,
      topics: updatedTopics,
    });
    setNewTopicInput((prev) => ({ ...prev, [subject.id]: '' }));
  };

  const handleRemoveTopic = (subject: Subject, topicIndex: number) => {
    const updatedTopics = subject.topics.filter((_, idx) => idx !== topicIndex);
    onSaveSubject({
      ...subject,
      topics: updatedTopics,
    });
  };

  const handleUpdateMastery = (subject: Subject, delta: number) => {
    const newMastery = Math.min(Math.max(subject.masteryPercent + delta, 0), 100);
    onSaveSubject({
      ...subject,
      masteryPercent: newMastery,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Academic Subjects & Syllabus
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize coursework, map out curriculum topics, set target grades, and monitor exam countdowns.
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No subjects added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your college or school courses to track tasks, organize notes, and generate targeted AI study plans.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
          >
            Create Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const colors = getSubjectColorClasses(subject.color);
            const countdown = formatDaysRemaining(subject.examDate);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Subject Header Bar */}
                <div className={`p-5 border-b border-slate-100 flex items-start justify-between gap-3`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${colors.badge}`}>
                        {subject.code}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {subject.creditHours ? `${subject.creditHours} Credits` : ''}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {subject.name}
                    </h3>
                    {subject.instructor && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        Instructor: {subject.instructor}
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(subject)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${subject.code}?`)) {
                          onDeleteSubject(subject.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subject Info Badges */}
                <div className="p-5 space-y-4 flex-1">
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    
                    {/* Target Grade */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Target Grade</span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {subject.targetGrade || 'Not set'}
                      </span>
                    </div>

                    {/* Exam Date */}
                    <div className={`p-2.5 rounded-xl border ${countdown.urgent ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[11px] text-slate-400 block font-medium">Exam Date</span>
                      <span className={`font-bold text-xs flex items-center gap-1 mt-0.5 ${countdown.urgent ? 'text-rose-700' : 'text-slate-800'}`}>
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {subject.examDate || 'Not set'}
                      </span>
                    </div>

                    {/* Countdown */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-slate-400 block font-medium">Time Left</span>
                      <span className={`font-bold text-xs flex items-center gap-1 mt-0.5 ${countdown.urgent ? 'text-rose-600 font-extrabold' : 'text-slate-700'}`}>
                        {countdown.text}
                      </span>
                    </div>

                  </div>

                  {/* Syllabus Mastery Slider / Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Course Mastery & Readiness</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateMastery(subject, -5)}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                          title="Decrease mastery"
                        >
                          -5%
                        </button>
                        <span className="font-extrabold text-slate-900 px-1">{subject.masteryPercent}%</span>
                        <button
                          onClick={() => handleUpdateMastery(subject, 5)}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                          title="Increase mastery"
                        >
                          +5%
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${colors.bg}`}
                        style={{ width: `${subject.masteryPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics Syllabus List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Syllabus Topics ({subject.topics.length})</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {subject.topics.map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200/60 group"
                        >
                          <span>{topic}</span>
                          <button
                            onClick={() => handleRemoveTopic(subject, tIdx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Topic input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add topic (e.g., Dynamic Programming)..."
                        value={newTopicInput[subject.id] || ''}
                        onChange={(e) =>
                          setNewTopicInput((prev) => ({ ...prev, [subject.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTopic(subject);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleAddTopic(subject)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>

                  </div>

                </div>

                {/* Action Bar Footer */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onOpenTimerForSubject(subject.id, `Revision: ${subject.name}`)}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-700" />
                    <span>Study</span>
                  </button>

                  <button
                    onClick={() => onGenerateQuizForSubject(subject)}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-violet-600" />
                    <span>AI Quiz</span>
                  </button>

                  <button
                    onClick={() => onGeneratePlanForSubject(subject)}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Plan</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSubject.id.startsWith('sub-') && subjects.some((s) => s.id === editingSubject.id)
                  ? 'Edit Subject'
                  : 'Add New Academic Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="font-semibold text-slate-700">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS201"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Instructor</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Alan Smith"
                    value={editingSubject.instructor || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. A+ or 95%"
                    value={editingSubject.targetGrade || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, targetGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={editingSubject.creditHours || 3}
                    onChange={(e) => setEditingSubject({ ...editingSubject, creditHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Final / Midterm Exam Date</label>
                  <input
                    type="date"
                    value={editingSubject.examDate || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, examDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-slate-700">Subject Color Tag</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVAILABLE_COLORS.map((c) => {
                    const cClasses = getSubjectColorClasses(c);
                    const isSelected = editingSubject.color === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setEditingSubject({ ...editingSubject, color: c })}
                        className={`w-7 h-7 rounded-full ${cClasses.bg} flex items-center justify-center transition-transform ${
                          isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Topics / Syllabus */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-slate-700">Key Syllabus Topics (Comma separated)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Binary Search Trees, Dynamic Programming, Graph Traversal"
                  value={editingSubject.topics.join(', ')}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      topics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Subject
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};