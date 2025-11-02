import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, BellOff, ShieldCheck, ShieldOff } from 'lucide-react';
import TwoFactorAuthSetup from './TwoFactorAuthSetup';

const Settings: React.FC = () => {
  const { 
    pushState, 
    subscribeToPushNotifications, 
    unsubscribeFromPushNotifications,
    twoFactorAuth,
    open2FASetup,
    disable2FA,
  } = useAppStore();

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Settings</h3>
      <div className="space-y-4">
        {/* Push Notifications Setting */}
        {pushState.isSupported && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Push Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable reminders and updates.
                </p>
                </div>
                {pushState.isSubscribed ? (
                <button
                    onClick={unsubscribeFromPushNotifications}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <BellOff size={16} /> Disable
                </button>
                ) : (
                <button
                    onClick={subscribeToPushNotifications}
                    className="flex items-center gap-2 bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <Bell size={16} /> Enable
                </button>
                )}
            </div>
        )}

        {/* 2FA Setting */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Add an extra layer of security.
            </p>
            </div>
            {twoFactorAuth.isEnabled ? (
            <button
                onClick={disable2FA}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <ShieldOff size={16} /> Disable
            </button>
            ) : (
            <button
                onClick={open2FASetup}
                className="flex items-center gap-2 bg-calm-green-500 hover:bg-calm-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <ShieldCheck size={16} /> Enable
            </button>
            )}
        </div>
      </div>
      <TwoFactorAuthSetup />
    </div>
  );
};

export default Settings;