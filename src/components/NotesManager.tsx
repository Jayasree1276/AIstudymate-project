import React, { useState } from 'react';
import { Note, Subject, KeyConcept } from '../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  HelpCircle, 
  BrainCircuit, 
  Tag, 
  BookOpen, 
  Loader2,
  ListFilter,
  Layers,
  FileCode,
  Zap,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSubjectColorClasses } from '../utils/theme';
import { api } from '../services/api';

interface NotesManagerProps {
  notes: Note[];
  subjects: Subject[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onGenerateQuizFromNote: (note: Note) => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  subjects,
  onSaveNote,
  onDeleteNote,
  onGenerateQuizFromNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'ai-insights'>('editor');
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedSubjectId !== 'all' && n.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = (n.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      subjectId: subjects[0]?.id || '',
      title: 'New Lecture Note',
      content: `# Lecture Title & Topic\n\n### Key Principles\n- Write down key concepts here...\n- Formulas and definitions\n\n### Examples\n- Example 1...`,
      tags: ['Lecture'],
      isFavorite: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setActiveTab('editor');
  };

  const handleUpdateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...updates };
    onSaveNote(updated);
  };

  const handleTriggerAISummarize = async (mode: 'full' | 'cheat_sheet' | 'bullet_summary' = 'full') => {
    if (!activeNote || !activeNote.content.trim()) return;
    try {
      setIsSummarizing(true);
      const subject = subjects.find((s) => s.id === activeNote.subjectId);
      const result = await api.summarizeAINote({
        noteContent: activeNote.content,
        title: activeNote.title,
        subjectName: subject?.name || 'Academic Course',
        mode,
      });

      handleUpdateActiveNote({
        aiSummary: result.summary,
        keyConcepts: result.keyConcepts,
        quickReviewPoints: result.quickReviewPoints,
        cheatSheetMarkdown: result.formulaOrCheatSheet,
      });

      setActiveTab('ai-insights');
    } catch (err: any) {
      alert(`AI Summarizer error: ${err.message || 'Failed to process note'}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Smart Academic Notes & AI Summarizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture rich Markdown lecture notes, extract key definitions with AI, and generate high-yield cheat sheets.
          </p>
        </div>

        <button
          id="btn-create-note"
          onClick={handleCreateNote}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Split Layout: Left Column (List) & Right Column (Editor / AI View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          
          {/* Search & Subject Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No notes found. Click "New Note" above!
              </div>
            ) : (
              filteredNotes.map((note) => {
                const subject = subjects.find((s) => s.id === note.subjectId);
                const colors = getSubjectColorClasses(subject?.color || 'slate');
                const isSelected = activeNote?.id === note.id;

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {subject && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                            {subject.code}
                          </span>
                        )}
                        {note.aiSummary && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-violet-100 text-violet-700 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-violet-600" />
                            AI Summary
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateActiveNote({ isFavorite: !note.isFavorite });
                        }}
                        className="text-slate-400 hover:text-amber-500"
                      >
                        {note.isFavorite ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {note.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {note.content.replace(/[#*`_]/g, '')}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Recent'}</span>
                      {note.tags && note.tags.length > 0 && (
                        <span className="font-medium text-slate-500">#{note.tags[0]}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Editor & AI Views (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          
          {activeNote ? (
            <>
              {/* Note Top Toolbar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Subject Selector & Title */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={activeNote.subjectId}
                      onChange={(e) => handleUpdateActiveNote({ subjectId: e.target.value })}
                      className="px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                    placeholder="Note Title..."
                    className="w-full text-base sm:text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 px-0"
                  />
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('editor')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        activeTab === 'editor' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Markdown Preview
                    </button>
                    <button
                      onClick={() => setActiveTab('ai-insights')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                        activeTab === 'ai-insights' ? 'bg-white text-violet-700 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      <span>AI Insights</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyContent}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this note?')) onDeleteNote(activeNote.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* AI Action Quick Ribbon */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-violet-50/60 to-indigo-50/60 border-b border-indigo-100/60 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Supercharger:
                  </span>
                  
                  <button
                    onClick={() => handleTriggerAISummarize('full')}
                    disabled={isSummarizing}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg shadow-2xs flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                    <span>Summarize Note</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAISummarize('cheat_sheet')}
                    disabled={isSummarizing}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 rounded-lg shadow-2xs flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Extract Cheat Sheet</span>
                  </button>

                  <button
                    onClick={() => onGenerateQuizFromNote(activeNote)}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Generate Quiz from Note</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="p-5 flex-1 min-h-[420px]">
                
                {/* Editor Tab */}
                {activeTab === 'editor' && (
                  <div className="space-y-3 h-full flex flex-col">
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                      placeholder="Type your lecture notes in Markdown..."
                      className="w-full flex-1 min-h-[380px] font-mono text-xs sm:text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                    />

                    {/* Tags editor */}
                    <div className="flex items-center gap-2 pt-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Tags:</span>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 4, Exams, Formulas (Comma separated)"
                        value={(activeNote.tags || []).join(', ')}
                        onChange={(e) =>
                          handleUpdateActiveNote({
                            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          })
                        }
                        className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Markdown Preview Tab */}
                {activeTab === 'preview' && (
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed p-2 bg-white rounded-xl">
                    <div className="markdown-body">
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* AI Insights & Summary Tab */}
                {activeTab === 'ai-insights' && (
                  <div className="space-y-5">
                    
                    {!activeNote.aiSummary && !isSummarizing && (
                      <div className="text-center py-12 border border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 p-6 space-y-3">
                        <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
                        <h4 className="font-bold text-slate-800 text-sm">No AI Summary generated yet</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Click "Summarize Note" to extract concise key concepts, definitions, revision points, and formula cheat sheets.
                        </p>
                        <button
                          onClick={() => handleTriggerAISummarize('full')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Generate AI Summary Now
                        </button>
                      </div>
                    )}

                    {isSummarizing && (
                      <div className="text-center py-16 space-y-3">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                          Gemini 3.7 is analyzing your notes & extracting high-yield exam concepts...
                        </p>
                      </div>
                    )}

                    {activeNote.aiSummary && !isSummarizing && (
                      <div className="space-y-5">
                        
                        {/* Executive Summary */}
                        <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200/80 space-y-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-violet-900 flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-violet-600" />
                            Executive AI Summary
                          </h4>
                          <p className="text-xs text-violet-950/90 leading-relaxed">
                            {activeNote.aiSummary}
                          </p>
                        </div>

                        {/* Key Concepts Extracted */}
                        {activeNote.keyConcepts && activeNote.keyConcepts.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                              Key Definitions & Core Concepts ({activeNote.keyConcepts.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeNote.keyConcepts.map((kc, kIdx) => (
                                <div
                                  key={kIdx}
                                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-xs">{kc.term}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      kc.importance === 'Crucial' 
                                        ? 'bg-rose-100 text-rose-700' 
                                        : 'bg-indigo-100 text-indigo-700'
                                    }`}>
                                      {kc.importance}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{kc.definition}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Review Points */}
                        {activeNote.quickReviewPoints && activeNote.quickReviewPoints.length > 0 && (
                          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-emerald-600" />
                              Rapid Review Checklist
                            </h4>
                            <ul className="space-y-1.5 text-xs text-emerald-950/90">
                              {activeNote.quickReviewPoints.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Formula / Cheat Sheet Table */}
                        {activeNote.cheatSheetMarkdown && (
                          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 overflow-x-auto">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                              Formulas & Quick Cheat Sheet
                            </h4>
                            <div className="prose prose-invert max-w-none text-xs">
                              <div className="markdown-body">
                                <ReactMarkdown>{activeNote.cheatSheetMarkdown}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>

            </>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select or create a note to begin.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
