import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Meeting } from '../../types';
import { formatDateString } from '../../utils/formatting';

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  existingMeeting: Meeting | null;
  onOpenExisting: () => void;
  onCreateAnyway: () => void;
  onClose: () => void;
}

export const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  isOpen,
  existingMeeting,
  onOpenExisting,
  onCreateAnyway,
  onClose,
}) => {
  if (!existingMeeting) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
          <AlertTriangle className="w-5 h-5" />
          This meeting may already exist
        </div>
      }
      description="We found an existing meeting with a similar number and date."
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {existingMeeting.meetingNumber}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDateString(existingMeeting.date)}
            {existingMeeting.theme && ` · "${existingMeeting.theme}"`}
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Would you like to open the existing meeting, or create a new one anyway?
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={onOpenExisting}
          >
            Open Existing Meeting
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onCreateAnyway}
          >
            Create New Anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
};
