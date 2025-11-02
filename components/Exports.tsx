import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ExportFormat } from '../types';
import { Download, Loader, CheckCircle, XCircle, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const formatDetails: Record<ExportFormat, { label: string; icon: React.ReactNode }> = {
  json: { label: 'JSON', icon: <FileJson size={16} /> },
  markdown: { label: 'Markdown', icon: <FileText size={16} /> },
  'csv-tasks': { label: 'Tasks (CSV)', icon: <FileSpreadsheet size={16} /> },
  'csv-goals': { label: 'Goals (CSV)', icon: <FileSpreadsheet size={16} /> },
  'csv-routine': { label: 'Routine (CSV)', icon: <FileSpreadsheet size={16} /> },
  'csv-logs': { label: 'Logs (CSV)', icon: <FileSpreadsheet size={16} /> },
};

const statusIcons = {
  pending: <Loader size={16} className="text-slate-400 animate-spin" />,
  processing: <Loader size={16} className="text-blue-500 animate-spin" />,
  complete: <CheckCircle size={16} className="text-green-500" />,
  failed: <XCircle size={16} className="text-red-500" />,
};

const Exports: React.FC = () => {
  const { exports, requestExport, fetchExports } = useAppStore();

  useEffect(() => {
    if (exports.data.length === 0) {
      fetchExports();
    }
  }, [fetchExports, exports.data.length]);
  
  const handleLoadMore = () => {
    if (exports.nextCursor) {
      fetchExports(exports.nextCursor);
    }
  };

  const handleRequestExport = (format: ExportFormat) => {
    requestExport(format);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Data Exports</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Request a copy of your data. Exports are processed in the background and will appear here in real-time.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(formatDetails).map(([format, details]) => (
          <button
            key={format}
            onClick={() => handleRequestExport(format as ExportFormat)}
            className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
          >
            {details.icon}
            {details.label}
          </button>
        ))}
      </div>

      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Recent Exports</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        <AnimatePresence>
        {exports.data.length > 0 ? (
          exports.data.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm"
            >
              <div className="flex items-center gap-3">
                {statusIcons[job.status]}
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{formatDetails[job.format].label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Requested on {format(parseISO(job.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div>
                {job.status === 'complete' && job.downloadUrl ? (
                  <a
                    href={job.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-semibold text-xs py-1 px-3 rounded-full transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </a>
                ) : (
                  <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{job.status}...</span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">No recent exports.</p>
        )}
        </AnimatePresence>
      </div>
      {exports.nextCursor && (
        <div className="mt-4">
          <button
            onClick={handleLoadMore}
            className="w-full text-center text-sm font-semibold text-calm-blue-600 hover:text-calm-blue-700 dark:text-calm-blue-400 dark:hover:text-calm-blue-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Exports;
