import { isToday, isThisWeek, isThisMonth } from 'date-fns';

// Helper function to check if a task is due today
export const isTaskDueToday = (dueDate) => {
    if (!dueDate) return true; // Show tasks without a due date in all timeframes
    const date = new Date(dueDate); // Ensure date is a Date object
    return isToday(date);
};

// Helper function to check if a task is due this week
export const isTaskDueThisWeek = (dueDate) => {
    if (!dueDate) return true; // Show tasks without a due date in all timeframes
    const date = new Date(dueDate);
    return isThisWeek(date, { weekStartsOn: 1 }); // Default: week starts on Monday
};

// Helper function to check if a task is due this month
export const isTaskDueThisMonth = (dueDate) => {
    if (!dueDate) return true; // Show tasks without a due date in all timeframes
    const date = new Date(dueDate);
    return isThisMonth(date);
};
