
import { format, differenceInDays, differenceInHours, differenceInMinutes, parseISO, isValid } from 'date-fns';

export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const formatLogTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};

export const getDeadlineCountdown = (deadlineISO: string | null): string => {
  if (!deadlineISO) return 'No deadline';
  const deadline = parseISO(deadlineISO);
  if (!isValid(deadline)) return 'Invalid date';

  const now = new Date();
  if (now > deadline) return 'Past due';
  
  const days = differenceInDays(deadline, now);
  if (days > 0) return `${days}d left`;

  const hours = differenceInHours(deadline, now);
  if (hours > 0) return `${hours}h left`;

  const minutes = differenceInMinutes(deadline, now);
  return `${minutes}m left`;
};
