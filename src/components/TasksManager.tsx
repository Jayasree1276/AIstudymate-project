import React, { useState } from 'react';
import { Task, Subject, TaskPriority, TaskStatus } from '../types';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  Trash2, 
  Edit3, 
  Play, 
  CheckCircle2, 
  Circle, 
  Layers, 
  List, 
  Tag, 
  X,
  AlertTriangle
} from 'lucide-react';
import { getSubjectColorClasses } from '../utils/theme';

interface TasksManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onSaveTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenTimerForTask: (subjectId: string, taskTitle: string) => void;
}

export const TasksManager: React.FC<TasksManagerProps> = ({
  tasks,
  subjects,
  onSaveTask,
  onDeleteTask,
  onOpenTimerForTask,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedSubjectId !== 'all' && task.subjectId !== selectedSubjectId) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      const matchTags = (task.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const totalEstMinutes = filteredTasks
    .filter((t) => t.status !== 'done')
    .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const handleOpenAdd = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTask({
      id: `task-${Date.now()}`,
      subjectId: subjects[0]?.id || '',
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Medium',
      status: defaultStatus,
      estimatedMinutes: 45,
      actualMinutesSpent: 0,
      tags: [],
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title || !editingTask.subjectId) return;
    onSaveTask(editingTask);
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    onSaveTask({ ...task, status: newStatus });
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'High':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Study Tasks & Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track problem sets, lab reports, revision tasks, and readings with estimated study hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Pending Study Work</p>
            <p className="text-sm font-bold text-slate-800">
              {(totalEstMinutes / 60).toFixed(1)} hrs estimated
            </p>
          </div>

          <button
            id="btn-add-task"
            onClick={() => handleOpenAdd('todo')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Task Views */}
      {viewMode === 'kanban' ? (
        /* Kanban 3-Column Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: To Do */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">To Do</h3>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-full">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subjects={subjects}
                  onEdit={() => handleOpenEdit(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onStatusChange={(status) => handleStatusChange(task, status)}
                  onStartFocus={() => onOpenTimerForTask(task.subjectId, task.title)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}

              <button
                onClick={() => handleOpenAdd('todo')}
                className="w-full py-2.5 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to To Do
              </button>
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider">In Progress</h3>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subjects={subjects}
                  onEdit={() => handleOpenEdit(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onStatusChange={(status) => handleStatusChange(task, status)}
                  onStartFocus={() => onOpenTimerForTask(task.subjectId, task.title)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}

              <button
                onClick={() => handleOpenAdd('in-progress')}
                className="w-full py-2.5 border border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-100/40 text-amber-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to In Progress
              </button>
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Completed</h3>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subjects={subjects}
                  onEdit={() => handleOpenEdit(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onStatusChange={(status) => handleStatusChange(task, status)}
                  onStartFocus={() => onOpenTimerForTask(task.subjectId, task.title)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}

              {doneTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Completed tasks will appear here.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tasks match your filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const colors = getSubjectColorClasses(subject?.color || 'slate');
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
                    isDone ? 'bg-slate-50/40 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleStatusChange(task, isDone ? 'todo' : 'done')}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                        isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-transparent" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                        {subject && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                            {subject.code}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 hidden sm:inline flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {task.dueDate}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.estimatedMinutes}m
                    </span>

                    {!isDone && (
                      <button
                        onClick={() => onOpenTimerForTask(task.subjectId, task.title)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Start Focus Timer on this task"
                      >
                        <Play className="w-4 h-4 fill-indigo-600" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTask.id.startsWith('task-') && tasks.some((t) => t.id === editingTask.id)
                  ? 'Edit Study Task'
                  : 'Add New Study Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              
              {/* Subject Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Course / Subject *</label>
                <select
                  required
                  value={editingTask.subjectId}
                  onChange={(e) => setEditingTask({ ...editingTask, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Dijkstra Lab or Solve Chapter 4 Problem Set"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Task Details & Problem IDs</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Problems 12-25 on orthogonal bases..."
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Due Date & Estimated Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={editingTask.estimatedMinutes}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Priority Level</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab, Coding, ProblemSet, Homework"
                  value={(editingTask.tags || []).join(', ')}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
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
                  Save Task
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

interface TaskCardProps {
  task: Task;
  subjects: Subject[];
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onStartFocus: () => void;
  getPriorityBadge: (p: TaskPriority) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  subjects,
  onEdit,
  onDelete,
  onStatusChange,
  onStartFocus,
  getPriorityBadge,
}) => {
  const subject = subjects.find((s) => s.id === task.subjectId);
  const colors = getSubjectColorClasses(subject?.color || 'slate');

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all space-y-3 group">
      
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {subject && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${colors.badge}`}>
              {subject.code}
            </span>
          )}
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {/* Quick Menu */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Desc */}
      <div>
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="text-[9px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info & Move Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            {task.dueDate}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            {task.estimatedMinutes}m
          </span>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1">
          {task.status !== 'done' && (
            <button
              onClick={onStartFocus}
              className="p-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              title="Start Pomodoro Focus"
            >
              <Play className="w-3 h-3 fill-indigo-700" />
            </button>
          )}

          {task.status === 'todo' && (
            <button
              onClick={() => onStatusChange('in-progress')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
            >
              Start →
            </button>
          )}
          {task.status === 'in-progress' && (
            <button
              onClick={() => onStatusChange('done')}
              className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold flex items-center gap-0.5"
            >
              <CheckCircle2 className="w-3 h-3" />
              Done
            </button>
          )}
          {task.status === 'done' && (
            <button
              onClick={() => onStatusChange('todo')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
