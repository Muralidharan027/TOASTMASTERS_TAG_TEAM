import React, { useEffect, useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Edit2,
  Users,
  ListOrdered,
} from 'lucide-react';
import { useTriviaStore } from '../../store/useTriviaStore';
import { useMeetingStore } from '../../store/useMeetingStore';
import { TriviaLiveMode } from './TriviaLiveMode';
import { Leaderboard } from './Leaderboard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { TriviaQuestion, TriviaOptionKey } from '../../types';

export const TriviaDashboard: React.FC = () => {
  const { activeMeeting, speakers } = useMeetingStore();
  const {
    questions,
    participants,
    activeQuestionIndex,
    isAnswerRevealed,
    isLiveMode,
    loadTrivia,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addParticipant,
    awardPoints,
    setLiveMode,
    revealAnswer,
    nextQuestion,
    prevQuestion,
    celebrateWinner,
  } = useTriviaStore();

  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Question Form State
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<TriviaOptionKey>('A');
  const [points, setPoints] = useState(1);
  const [notes, setNotes] = useState('');

  // Add Participant Form State
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);

  useEffect(() => {
    if (activeMeeting) {
      loadTrivia(activeMeeting.id);
    }
  }, [activeMeeting, loadTrivia]);

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setPoints(1);
    setNotes('');
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: TriviaQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question);
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectAnswer(q.correctAnswer);
    setPoints(q.points || 1);
    setNotes(q.notes || '');
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !activeMeeting) return;

    if (editingQuestionId) {
      await updateQuestion(editingQuestionId, {
        question: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        points: Number(points),
        notes: notes.trim() || undefined,
      });
    } else {
      await addQuestion(activeMeeting.id, {
        question: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        points: Number(points),
        notes: notes.trim() || undefined,
      });
    }

    setIsAddQuestionModalOpen(false);
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim() || !activeMeeting) return;

    await addParticipant(activeMeeting.id, newParticipantName.trim());
    setNewParticipantName('');
    setIsAddParticipantModalOpen(false);
  };

  const handleImportSpeakersAsParticipants = async () => {
    if (!activeMeeting) return;
    for (const spk of speakers) {
      if (!participants.some((p) => p.name.toLowerCase() === spk.name.toLowerCase())) {
        await addParticipant(activeMeeting.id, spk.name);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* 1. Mode Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600 dark:text-sky-400">
            Trivia Master Workspace
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Today's Trivia Session
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isLiveMode ? (
            <Button
              size="md"
              variant="outline"
              onClick={() => setLiveMode(false)}
            >
              Exit Live Mode
            </Button>
          ) : (
            <Button
              size="md"
              variant="trivia"
              onClick={() => {
                if (questions.length > 0) {
                  setLiveMode(true);
                } else {
                  handleOpenAddQuestion();
                }
              }}
              leftIcon={<Play className="w-4 h-4 fill-current" />}
            >
              Start Live Trivia
            </Button>
          )}
        </div>
      </div>

      {/* 2. Live Mode or Setup Mode */}
      {isLiveMode ? (
        <div className="space-y-6">
          <TriviaLiveMode
            questions={questions}
            activeIndex={activeQuestionIndex}
            isRevealed={isAnswerRevealed}
            participants={participants}
            onReveal={revealAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onAwardPoints={awardPoints}
            onFinishTrivia={() => {
              celebrateWinner();
              setLiveMode(false);
            }}
          />

          <Leaderboard
            participants={participants}
            onCelebrateWinner={celebrateWinner}
            onAwardPoints={awardPoints}
            showQuickScoring
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card padding="sm" className="text-center bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900">
              <span className="text-xs uppercase font-extrabold text-sky-700 dark:text-sky-400">Questions</span>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                {questions.length}
              </div>
            </Card>

            <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs uppercase font-extrabold text-slate-400">Participants</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {participants.length}
              </div>
            </Card>

            <Card padding="sm" className="text-center bg-slate-50 dark:bg-slate-900/60 col-span-2 sm:col-span-1">
              <span className="text-xs uppercase font-extrabold text-slate-400">Leader</span>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate mt-1">
                {participants.sort((a, b) => b.score - a.score)[0]?.name || 'None'}
              </div>
            </Card>
          </div>

          {/* Question Bank List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-sky-600" />
                Question Bank ({questions.length})
              </h3>

              <Button
                size="sm"
                variant="trivia"
                onClick={handleOpenAddQuestion}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + New Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <Card variant="subtle" className="text-center py-8">
                <p className="text-sm text-slate-500 mb-3">No trivia questions added yet.</p>
                <Button size="sm" variant="outline" onClick={handleOpenAddQuestion}>
                  + Add First Question
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <Card key={q.id} padding="md" className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {q.question}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Correct: <strong className="text-emerald-600">{q.correctAnswer}</strong> • {q.points || 1} pt
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className={`p-1.5 rounded-lg ${q.correctAnswer === 'A' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                        A: {q.optionA}
                      </div>
                      <div className={`p-1.5 rounded-lg ${q.correctAnswer === 'B' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                        B: {q.optionB}
                      </div>
                      {q.optionC && (
                        <div className={`p-1.5 rounded-lg ${q.correctAnswer === 'C' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                          C: {q.optionC}
                        </div>
                      )}
                      {q.optionD && (
                        <div className={`p-1.5 rounded-lg ${q.correctAnswer === 'D' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                          D: {q.optionD}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Participants & Leaderboard */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                Participants ({participants.length})
              </h3>

              <div className="flex items-center gap-2">
                {speakers.length > 0 && (
                  <button
                    onClick={handleImportSpeakersAsParticipants}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    + Import Speakers
                  </button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddParticipantModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Participant
                </Button>
              </div>
            </div>

            <Leaderboard
              participants={participants}
              onCelebrateWinner={celebrateWinner}
              onAwardPoints={awardPoints}
              showQuickScoring
            />
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title={editingQuestionId ? 'Edit Trivia Question' : 'Add Trivia Question'}
        description="Provide the question prompt and multiple-choice options."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Question Prompt *
            </label>
            <textarea
              required
              rows={2}
              autoFocus
              placeholder="e.g. Which planet is known as the Red Planet?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Option A *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Earth"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Option B *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mars"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Option C (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Venus"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Option D (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Jupiter"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                Correct Answer *
              </label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value as TriviaOptionKey)}
                className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Points Worth
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Explanation / Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Known as the Red Planet due to iron oxide on its surface."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="trivia">
              {editingQuestionId ? 'Save Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Participant Modal */}
      <Modal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        title="Add Trivia Participant"
        description="Enter member name to track trivia scores"
      >
        <form onSubmit={handleSaveParticipant} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Participant Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. TM Amanda"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddParticipantModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="trivia">
              Add Participant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
