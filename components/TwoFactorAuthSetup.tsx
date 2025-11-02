import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

const TwoFactorAuthSetup: React.FC = () => {
  const { twoFactorAuth, close2FASetup, verifyAndEnable2FA } = useAppStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await verifyAndEnable2FA(code);
      // Success will automatically close the modal via the store state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {twoFactorAuth.isSetupModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={close2FASetup}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close2FASetup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Set Up Two-Factor Authentication</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the 6-digit code to verify.</p>

            <div className="flex flex-col items-center gap-4 mb-6">
                {twoFactorAuth.setupQrCode ? (
                    <img src={twoFactorAuth.setupQrCode} alt="2FA QR Code" className="rounded-lg" />
                ) : (
                    <div className="w-[150px] h-[150px] bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-slate-500">Loading QR...</p>
                    </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono p-2 bg-slate-100 dark:bg-slate-700 rounded">
                    Or enter manually: {twoFactorAuth.setupSecret}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="2fa-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Verification Code
                </label>
                <input
                    id="2fa-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 text-center text-2xl tracking-widest font-mono"
                    placeholder="123456"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                 <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-calm-green-500 hover:bg-calm-green-600 text-white font-bold py-3 px-4 rounded-lg transition mt-4 disabled:bg-slate-400"
                 >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ShieldCheck size={20} />}
                    Verify & Enable
                 </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TwoFactorAuthSetup;