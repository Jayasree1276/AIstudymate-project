import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Clock,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSubjectColorClasses } from '../utils/theme';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
  initialTopic?: string;
  onSessionComplete: (session: StudySession) => void;
}

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: { [key in TimerMode]: number } = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  initialTopic = '',
  onSessionComplete,
}) => {
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId || subjects[0]?.id || '');
  const [topic, setTopic] = useState<string>(initialTopic || 'General Coursework Study');
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'whitenoise' | 'binaural'>('none');

  // Web Audio Context reference for ambient noise
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (initialSubjectId) setSubjectId(initialSubjectId);
    if (initialTopic) setTopic(initialTopic);
  }, [initialSubjectId, initialTopic]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Completed!
      setIsActive(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Web audio sound synthesizer for ambient study focus
  useEffect(() => {
    if (ambientSound === 'none') {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (ambientSound === 'whitenoise') {
        // Generate soft pink/white noise buffer
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15;
        whiteNoise.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
      } else if (ambientSound === 'binaural') {
        // 432 Hz Alpha Waves for calm deep focus
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        noiseNodeRef.current = osc;
      }
    } catch (e) {
      console.log('Audio init prevented:', e);
    }

    return () => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
    };
  }, [ambientSound]);

  const handleFinishSession = () => {
    const plannedDurationMinutes = Math.round(MODE_DURATIONS[mode] / 60);
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subjectId: subjectId || subjects[0]?.id || 'sub-general',
      topic: topic.trim() || 'General Study Session',
      durationMinutes: plannedDurationMinutes,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    onSessionComplete(newSession);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  const currentSubject = subjects.find((s) => s.id === subjectId);
  const colors = getSubjectColorClasses(currentSubject?.color || 'indigo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Pomodoro Focus Timer</h3>
              <p className="text-xs text-slate-400">Deep study immersion & active tracking</p>
            </div>
          </div>

          <button
            onClick={() => {
              setAmbientSound('none');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 relative z-10">
          <button
            onClick={() => handleSwitchMode('pomodoro')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'pomodoro' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'longBreak' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Countdown Display */}
        <div className="text-center py-6 relative z-10 space-y-2">
          <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-48 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                mode === 'pomodoro' ? 'bg-indigo-500' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-violet-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Course & Topic Selector Inputs */}
        <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 relative z-10 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Topic / Goal</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chapter 5 Problem Set"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Ambient Sound synthesis */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <span className="text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              Focus Ambient Sound:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAmbientSound('none')}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  ambientSound === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mute
              </button>
              <button
                type="button"
                onClick={() => setAmbientSound('whitenoise')}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  ambientSound === 'whitenoise' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rain Noise
              </button>
              <button
                type="button"
                onClick={() => setAmbientSound('binaural')}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  ambientSound === 'binaural' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                432Hz Zen
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 relative z-10 pt-2">
          <button
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="btn-toggle-timer"
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishSession}
            className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-2xl transition-colors"
            title="Log Completed Session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
