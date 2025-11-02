import React from 'react';
import { motion } from 'framer-motion';

// A simple password strength checker. A library like zxcvbn is recommended for production.
const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return -1;
  if (password.length > 8) score++;
  if (password.length > 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLevels = [
  { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
  { label: 'Weak', color: 'bg-red-500', width: '40%' },
  { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
  { label: 'Good', color: 'bg-calm-green-500', width: '80%' },
  { label: 'Strong', color: 'bg-calm-green-500', width: '100%' },
];

const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
  const score = checkPasswordStrength(password);
  
  if (score === -1) {
    return null;
  }

  const strength = strengthLevels[Math.min(score, 4)];

  return (
    <div className="mt-2 h-4">
      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${strength.color}`}
          initial={{ width: 0 }}
          animate={{ width: password ? strength.width : '0%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <p className={`text-xs mt-1 text-right ${password ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        {strength.label}
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;