import React, { useState } from 'react';
import { Sparkles, PenLine, AlertCircle } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { BrochureUpload } from '../fetch/BrochureUpload';
import { ExtractionProgress } from '../fetch/ExtractionProgress';
import { ExtractionReview } from '../fetch/ExtractionReview';
import { DuplicateDetectionModal } from '../fetch/DuplicateDetectionModal';
import type { FetchedMeetingData, Meeting, TagRoleType, Speaker } from '../../types';
import { extractFromBrochure } from '../../utils/brochureExtractor';

type FlowStep = 'method-select' | 'upload' | 'extracting' | 'review' | 'creating' | 'error';

interface CreateMeetingScreenProps {
  onMeetingCreated: (meetingId: string) => void;
  onManualEntry: () => void;
  onOpenSettings: () => void;
}

function getExtractionErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === 'NO_API_KEY') return 'No API key configured. Please add your Gemini API key in Settings.';
  if (msg === 'INVALID_API_KEY') return 'The API key appears invalid. Please check your Gemini API key in Settings.';
  if (msg === 'NO_JSON_IN_RESPONSE' || msg === 'INVALID_JSON_RESPONSE')
    return "We couldn't confidently read this brochure. Try uploading a clearer image.";
  if (msg.startsWith('API_ERROR'))
    return 'The AI service returned an error. Please try again in a moment.';
  return "We couldn't read this brochure. Try a higher-resolution or better-lit image.";
}

export const CreateMeetingScreen: React.FC<CreateMeetingScreenProps> = ({
  onMeetingCreated,
  onManualEntry,
  onOpenSettings,
}) => {
  const { meetings, createMeeting, loadMeeting } = useMeetingStore();
  const { settings } = useSettingsStore();

  const [step, setStep] = useState<FlowStep>('method-select');
  const [method, setMethod] = useState<'fetch' | 'manual'>('fetch');
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [extractionStep, setExtractionStep] = useState(1);
  const [fetchedData, setFetchedData] = useState<FetchedMeetingData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Duplicate detection
  const [duplicateCandidate, setDuplicateCandidate] = useState<Meeting | null>(null);
  const [pendingCreate, setPendingCreate] = useState<FetchedMeetingData | null>(null);

  const hasApiKey = Boolean(settings.geminiApiKey);

  // ── Step: Upload → Extraction ─────────────────────────────────────────────
  const handleFileSelected = async (file: File, previewUrl: string) => {
    setSourceImageUrl(previewUrl);
    setStep('extracting');
    setExtractionStep(1);
    setErrorMsg('');

    try {
      const result = await extractFromBrochure(
        file,
        settings.geminiApiKey || '',
        (s) => setExtractionStep(s),
      );
      setFetchedData(result.data);
      setStep('review');
    } catch (err) {
      setErrorMsg(getExtractionErrorMessage(err));
      setStep('error');
    }
  };

  // ── Step: Review → Create ─────────────────────────────────────────────────
  const handleConfirmCreate = async (reviewed: FetchedMeetingData) => {
    // Check for duplicates first
    const duplicate = meetings.find(
      (m) =>
        (reviewed.meetingNumber && m.meetingNumber.toLowerCase() === reviewed.meetingNumber.toLowerCase()) ||
        (reviewed.date && m.date === reviewed.date && reviewed.meetingNumber &&
          m.meetingNumber.toLowerCase() === reviewed.meetingNumber.toLowerCase()),
    );

    if (duplicate) {
      setDuplicateCandidate(duplicate);
      setPendingCreate(reviewed);
      return;
    }

    await doCreate(reviewed);
  };

  const doCreate = async (reviewed: FetchedMeetingData) => {
    setDuplicateCandidate(null);
    setPendingCreate(null);
    setStep('creating');

    try {
      const today = new Date().toISOString().split('T')[0];

      // Build role data
      const getRolePlayer = (tagRole: TagRoleType) =>
        reviewed.roles.find((r) => r.tagTeamRole === tagRole)?.person || '';

      const roleData = {
        timer: getRolePlayer('timer'),
        ahCounter: getRolePlayer('ahCounter'),
        grammarian: getRolePlayer('grammarian'),
        triviaMaster: getRolePlayer('triviaMaster'),
      };

      // Build initial speakers from agenda items that have a person
      const initialSpeakers: Omit<Speaker, 'id' | 'meetingId' | 'order' | 'status'>[] = reviewed.agenda
        .filter((a) => a.person && a.role)
        .map((a) => ({
          name: a.person || 'TBD',
          role: a.role,
          session: a.session,
          allocatedMin: a.minimumTime || (a.maximumTime ? Math.round(a.maximumTime * 0.6) : 60),
          allocatedMax: a.maximumTime || 120,
          warningTime: a.targetTime,
        }));

      const meetingId = await createMeeting(
        {
          meetingNumber: reviewed.meetingNumber || `Meeting #${meetings.length + 1}`,
          date: reviewed.date || today,
          type: reviewed.meetingType || 'online',
          theme: reviewed.theme || '',
          wordOfDay: reviewed.wordOfDay || '',
          wordMeaning: reviewed.wordMeaning,
          idiom: reviewed.idiom || '',
          idiomMeaning: reviewed.idiomMeaning,
          venue: reviewed.venue,
        },
        roleData,
        initialSpeakers,
      );

      onMeetingCreated(meetingId);
    } catch (err) {
      console.error('Failed to create meeting from brochure:', err);
      setErrorMsg('Failed to save the meeting. Please try again.');
      setStep('error');
    }
  };

  // ── Duplicate: open existing ──────────────────────────────────────────────
  const handleOpenExisting = async () => {
    if (duplicateCandidate) {
      await loadMeeting(duplicateCandidate.id);
      onMeetingCreated(duplicateCandidate.id);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Add Meeting
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
          {step === 'upload' || step === 'method-select' ? 'How would you like to add it?' : ''}
          {step === 'extracting' ? 'Reading your brochure...' : ''}
          {step === 'review' ? 'Review Extracted Details' : ''}
          {step === 'creating' ? 'Creating meeting...' : ''}
          {step === 'error' ? 'Something went wrong' : ''}
        </h2>
      </div>

      {/* ── Step: Method Select ─────────────────────────────────────────── */}
      {step === 'method-select' && (
        <div className="space-y-5 max-w-lg mx-auto">
          {/* Segmented control */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-1 gap-1 bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMethod('fetch')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                method === 'fetch'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-subtle'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-violet-500" />
              Fetch
            </button>
            <button
              type="button"
              onClick={() => setMethod('manual')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                method === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-subtle'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <PenLine className="w-3.5 h-3.5 inline mr-1.5" />
              Manual
            </button>
          </div>

          {/* Fetch card */}
          {method === 'fetch' && (
            <div
              className="group p-6 rounded-3xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 cursor-pointer hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-lg transition-all"
              onClick={() => setStep('upload')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    ✦ Fetch from Brochure
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Upload your meeting agenda image and TAG TEAM will automatically extract
                    the meeting details, roles, and agenda.
                  </p>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-2">
                    Don't type the meeting. Just show it to TAG TEAM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual card */}
          {method === 'manual' && (
            <div
              className="group p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all"
              onClick={onManualEntry}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <PenLine className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    Enter Manually
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Fill in meeting details, roles, and agenda yourself using the existing
                    meeting setup form.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step: Upload ────────────────────────────────────────────────── */}
      {step === 'upload' && (
        <div className="max-w-lg mx-auto">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setStep('method-select')}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold cursor-pointer"
            >
              ← Back
            </button>
            <p className="text-sm text-slate-500 mt-1">
              Upload your Toastmasters meeting brochure and TAG TEAM will automatically extract the meeting details.
            </p>
          </div>
          <BrochureUpload
            onFileSelected={handleFileSelected}
            onManualEntry={onManualEntry}
            hasApiKey={hasApiKey}
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}

      {/* ── Step: Extracting ────────────────────────────────────────────── */}
      {step === 'extracting' && (
        <ExtractionProgress currentStep={extractionStep} />
      )}

      {/* ── Step: Review ────────────────────────────────────────────────── */}
      {step === 'review' && fetchedData && (
        <ExtractionReview
          data={fetchedData}
          sourceImageUrl={sourceImageUrl}
          onConfirm={handleConfirmCreate}
          onBack={() => setStep('upload')}
        />
      )}

      {/* ── Step: Creating ──────────────────────────────────────────────── */}
      {step === 'creating' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Creating your meeting...
          </p>
        </div>
      )}

      {/* ── Step: Error ─────────────────────────────────────────────────── */}
      {step === 'error' && (
        <div className="max-w-lg mx-auto">
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
              <h3 className="font-bold text-rose-800 dark:text-rose-300 text-base">
                We couldn't confidently read some details.
              </h3>
            </div>
            <p className="text-sm text-rose-700 dark:text-rose-400">{errorMsg}</p>
            <div className="text-sm text-rose-700 dark:text-rose-400 space-y-1">
              <p className="font-semibold">Try:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                <li>Uploading a clearer, higher-resolution image</li>
                <li>Taking the photo in better lighting</li>
                <li>Making sure the entire brochure is visible</li>
                <li>Checking your API key in Settings</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onManualEntry}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Detection Modal */}
      <DuplicateDetectionModal
        isOpen={duplicateCandidate !== null}
        existingMeeting={duplicateCandidate}
        onOpenExisting={handleOpenExisting}
        onCreateAnyway={() => pendingCreate && doCreate(pendingCreate)}
        onClose={() => { setDuplicateCandidate(null); setPendingCreate(null); }}
      />
    </div>
  );
};
