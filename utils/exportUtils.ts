
import { format, parseISO } from 'date-fns';
import { AppState } from '../store/useAppStore';
import { Goal } from '../types';

const getGoalsByCategory = (goals: Goal[], category: 'Short Term' | 'Long Term') => {
    return goals.filter(g => g.category === category && !g.archived);
};

export const exportStateToMarkdown = (state: AppState): string => {
    const today = new Date();
    let md = `# Proactive Planner Export - ${format(today, 'MMMM d, yyyy')}\n\n`;

    // Plan for today
    md += `## Today's Plan (${state.plan.date})\n`;
    if (state.plan.tasks.length > 0) {
        state.plan.tasks.forEach(task => {
            md += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
        });
    } else {
        md += `_No tasks planned for today._\n`;
    }
    md += '\n';

    // Daily Routine
    md += `## Daily Routine\n`;
    if (state.routine.length > 0) {
        state.routine.forEach(task => {
            md += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
        });
    } else {
        md += `_No routine tasks set up._\n`;
    }
    md += '\n';

    // Goals
    md += `## Goals\n`;
    const shortTermGoals = getGoalsByCategory(state.goals, 'Short Term');
    const longTermGoals = getGoalsByCategory(state.goals, 'Long Term');

    md += `### Short Term\n`;
    if (shortTermGoals.length > 0) {
        shortTermGoals.forEach(goal => {
            md += `- [${goal.completed ? 'x' : ' '}] ${goal.text}${goal.deadline ? ` (Due: ${format(parseISO(goal.deadline), 'MMM d')})` : ''}\n`;
        });
    } else {
        md += `_No short term goals._\n`;
    }
    md += '\n';
    
    md += `### Long Term\n`;
    if (longTermGoals.length > 0) {
        longTermGoals.forEach(goal => {
            md += `- [${goal.completed ? 'x' : ' '}] ${goal.text}${goal.deadline ? ` (Due: ${format(parseISO(goal.deadline), 'yyyy-MM-dd')})` : ''}\n`;
        });
    } else {
        md += `_No long term goals._\n`;
    }
    md += '\n';

    // Time Logs for Today
    md += `## Today's Time Log\n`;
    const todaysLogs = state.logs.filter(log => log.dateString === state.plan.date);
    if (todaysLogs.length > 0) {
        todaysLogs.forEach(log => {
            const duration = `${Math.floor(log.duration / 60)}m ${log.duration % 60}s`;
            md += `- **${log.task}**: ${duration}\n`;
        });
    } else {
        md += `_No time logged today._\n`;
    }
    md += '\n';

    // Reflections
    md += `## Past Reflections\n`;
    if (state.reflections.length > 0) {
        const sortedReflections = [...state.reflections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sortedReflections.slice(0, 7).forEach(r => { // Last 7 reflections
            md += `### ${format(parseISO(r.date), 'EEEE, MMMM d')}\n`;
            md += `- **Went well:** ${r.well}\n`;
            md += `- **To improve:** ${r.improve}\n\n`;
        });
    } else {
        md += `_No reflections saved yet._\n`;
    }

    return md;
};

const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    if (/[",\n\r]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export const convertToCsv = (state: AppState, dataType: 'tasks' | 'goals' | 'routine' | 'logs'): string => {
    let data: any[] = [];
    let headers: string[] = [];

    switch (dataType) {
        case 'tasks':
            data = state.plan.tasks;
            headers = ['id', 'text', 'completed', 'goalId', 'priority', 'tags', 'dependsOn'];
            break;
        case 'goals':
            data = state.goals;
            headers = ['id', 'text', 'category', 'completed', 'deadline', 'archived'];
            break;
        case 'routine':
            data = state.routine;
            headers = ['id', 'text', 'completed', 'goalId', 'recurringDays', 'dependsOn'];
            break;
        case 'logs':
            data = state.logs;
            headers = ['id', 'task', 'duration', 'timestamp', 'dateString'];
            break;
    }

    if (data.length === 0) {
        return 'No data available for export.';
    }

    const headerRow = headers.map(escapeCsvField).join(',');
    const dataRows = data.map(row => {
        return headers.map(header => {
            let value = row[header as keyof typeof row];
            if (Array.isArray(value)) {
                value = value.join(';'); // Use semicolon for multi-value fields
            }
            return escapeCsvField(value);
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
};
