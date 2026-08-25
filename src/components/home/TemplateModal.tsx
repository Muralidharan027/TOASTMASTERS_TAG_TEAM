import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { MeetingTemplate } from '../../types';
import { Modal } from '../common/Modal';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MeetingTemplate[];
  onSelectTemplate: (template: MeetingTemplate) => void;
  onStartBlank: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
  onStartBlank,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Meeting from Template"
      description="Start with preconfigured speakers and roles or begin with a clean slate"
      maxWidth="lg"
    >
      <div className="space-y-3">
        {/* Blank option */}
        <button
          onClick={() => {
            onClose();
            onStartBlank();
          }}
          className="w-full text-left p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold group-hover:scale-105 transition-transform">
              +
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Blank Meeting</div>
              <div className="text-xs text-slate-500">Configure theme, roles, and speakers manually from scratch</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
        </button>

        <div className="pt-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Available Templates
          </span>
        </div>

        {/* Templates list */}
        {templates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => {
              onClose();
              onSelectTemplate(tmpl);
            }}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:shadow-card bg-white dark:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {tmpl.name}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                    {tmpl.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{tmpl.description}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-medium">
                  <span>{tmpl.defaultSpeakers.length} Speakers included</span>
                  <span>•</span>
                  <span>4 TAG Roles predefined</span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </Modal>
  );
};
