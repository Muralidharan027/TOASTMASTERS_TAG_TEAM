import React, { useState } from 'react';
import { Copy, Download, Printer, Share2, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { copyToClipboard, shareReport, exportReportToPdf } from '../../utils/exportPdf';

interface ExportActionsProps {
  reportText: string;
  meetingNumber: string;
  reportElementId: string;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  reportText,
  meetingNumber,
  reportElementId,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(reportText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePdf = async () => {
    try {
      setIsExportingPdf(true);
      const filename = `TAG_TEAM_Report_${meetingNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await exportReportToPdf(reportElementId, filename);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback to print if html2canvas has issue
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShare = async () => {
    await shareReport(`TAG TEAM Report - ${meetingNumber}`, reportText);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <Button
        size="sm"
        variant="primary"
        onClick={handleCopy}
        leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      >
        {copied ? 'Copied Report!' : 'Copy Report'}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handlePdf}
        disabled={isExportingPdf}
        leftIcon={<Download className="w-4 h-4 text-slate-500" />}
      >
        {isExportingPdf ? 'Exporting...' : 'Download PDF'}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handlePrint}
        leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
      >
        Print
      </Button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          leftIcon={<Share2 className="w-4 h-4 text-slate-500" />}
        >
          Share
        </Button>
      )}
    </div>
  );
};
