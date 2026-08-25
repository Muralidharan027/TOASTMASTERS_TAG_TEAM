import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SpeakerSelector } from '../common/SpeakerSelector';
import { TimerSignals } from './TimerSignals';
import { FullscreenSignal } from './FullscreenSignal';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatTime, formatDurationRange, getStatusBadge } from '../../utils/formatting';

export const TimerDashboard: React.FC = () => {
  const {
    activeMeeting,
    speakers,
    activeSpeakerId,
    setActiveSpeakerId,
    nextSpeaker,
    prevSpeaker,
  } = useMeetingStore();

  const {
    isRunning,
    isPaused,
    elapsedSeconds,
    signalState,
    isFullscreenSignal,
    timerRecords,
    setActiveSpeaker,
    start,
    pause,
    resume,
    stopAndSave,
    reset,
    setFullscreenSignal,
  } = useTimerStore();

  const { settings, updateSettings } = useSettingsStore();

  const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId) || speakers[0];

  // Sync active speaker with timer store
  useEffect(() => {
    if (activeSpeaker && activeMeeting) {
      setActiveSpeaker(activeSpeaker.id, activeMeeting.id);
    }
  }, [activeSpeaker?.id, activeMeeting?.id]);

  // Desktop keyboard shortcuts (Space to start/pause, R to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!activeSpeaker) return;
        if (!isRunning) {
          start(activeSpeaker.allocatedMin, activeSpeaker.allocatedMax, activeSpeaker.warningTime);
        } else if (isPaused) {
          resume();
        } else {
          pause();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isPaused, activeSpeaker, start, pause, resume, reset]);

  const allocatedMin = activeSpeaker?.allocatedMin || 300;
  const allocatedMax = activeSpeaker?.allocatedMax || 420;

  const currentRecord = timerRecords.find((r) => r.speakerId === activeSpeaker?.id);
  const statusBadge = currentRecord ? getStatusBadge(currentRecord.status) : null;

  const handleStartOrPause = () => {
    if (!activeSpeaker) return;
    if (!isRunning) {
      start(allocatedMin, allocatedMax, activeSpeaker.warningTime);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStopAndSave = async () => {
    if (!activeSpeaker) return;
    await stopAndSave(allocatedMin, allocatedMax);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      {/* 1. Speaker Selector */}
      <SpeakerSelector
        speakers={speakers}
        activeSpeakerId={activeSpeakerId}
        onSelectSpeaker={setActiveSpeakerId}
        onNextSpeaker={nextSpeaker}
        onPrevSpeaker={prevSpeaker}
      />

      {/* 2. Main Stopwatch Card */}
      <Card
        padding="lg"
        className={`text-center space-y-6 transition-all duration-300 border-2 ${
          signalState === 'green'
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
            : signalState === 'yellow'
            ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
            : signalState === 'red' || signalState === 'over'
            ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Top details */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Allocated Range
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {formatDurationRange(allocatedMin, allocatedMax)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound toggle */}
            <button
              onClick={() => updateSettings({ timerSound: !settings.timerSound })}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                settings.timerSound
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
              }`}
              title={settings.timerSound ? 'Timer Audio Chimes ON' : 'Timer Audio Chimes OFF'}
            >
              {settings.timerSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen Signal */}
            <button
              onClick={() => setFullscreenSignal(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fullscreen Signal Card"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Giant Digital Stopwatch */}
        <div className="py-4">
          <div
            className={`text-6xl sm:text-8xl font-black font-mono tracking-tight transition-colors select-none ${
              signalState === 'green'
                ? 'text-emerald-600 dark:text-emerald-400'
                : signalState === 'yellow'
                ? 'text-amber-600 dark:text-amber-400'
                : signalState === 'red' || signalState === 'over'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {formatTime(elapsedSeconds)}
          </div>

          {/* Current Status Badge */}
          {statusBadge && !isRunning && elapsedSeconds > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider border shadow-xs">
              <span className={`px-2.5 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} border font-bold`}>
                {statusBadge.label} ({formatTime(currentRecord?.duration || 0)})
              </span>
            </div>
          )}
        </div>

        {/* 3. Signal Milestone Indicators */}
        <TimerSignals
          signalState={signalState}
          allocatedMin={allocatedMin}
          allocatedMax={allocatedMax}
          warningTime={activeSpeaker?.warningTime}
        />

        {/* 4. Large Primary Controls */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            size="xl"
            variant={isRunning && !isPaused ? 'secondary' : 'timer'}
            onClick={handleStartOrPause}
            leftIcon={
              isRunning && !isPaused ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )
            }
            className="sm:col-span-2 text-lg font-bold"
          >
            {!isRunning ? 'START TIMER' : isPaused ? 'RESUME' : 'PAUSE'}
          </Button>

          <Button
            size="xl"
            variant="outline"
            onClick={reset}
            leftIcon={<RotateCcw className="w-5 h-5" />}
            className="text-base font-semibold"
          >
            RESET
          </Button>
        </div>

        {/* Stop & Finish Speaker Button */}
        {(isRunning || elapsedSeconds > 0) && (
          <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onClick={handleStopAndSave}
              leftIcon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              className="text-sm font-bold"
            >
              FINISH & SAVE TIME FOR {activeSpeaker?.name.toUpperCase()}
            </Button>
          </div>
        )}
      </Card>

      {/* Keyboard Shortcut Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Space</kbd> Start / Pause</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">R</kbd> Reset</span>
      </div>

      {/* Fullscreen Signal Modal */}
      <FullscreenSignal
        isOpen={isFullscreenSignal}
        onClose={() => setFullscreenSignal(false)}
        signalState={signalState}
        elapsedSeconds={elapsedSeconds}
        speakerName={activeSpeaker?.name || 'Speaker'}
        speechType={activeSpeaker?.role || 'Prepared Speech'}
      />
    </div>
  );
};
