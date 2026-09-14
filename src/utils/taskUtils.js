/**
 * Utilities for calculating dynamic deadline status and human-friendly remaining time.
 */

export function parseTaskDateTime(dueDateStr, dueTimeStr) {
  if (!dueDateStr) return new Date();
  
  // Default to end of day 23:59:59 if time is not specified
  let hours = 23;
  let minutes = 59;
  let seconds = 59;

  if (dueTimeStr) {
    const timeMatch = dueTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      hours = h;
      minutes = m;
      seconds = 0;
    }
  }

  const [year, month, day] = dueDateStr.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

export function getTaskDeadlineInfo(task, currentDate = new Date()) {
  if (!task.dueDate) {
    return {
      status: task.status,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      daysDiff: 0,
      label: 'No due date',
      badgeClass: 'bg-slate-100 text-slate-600',
    };
  }

  const targetDate = parseTaskDateTime(task.dueDate, task.dueTime);
  
  // Normalized day comparison (ignoring time) for "Today" and "Tomorrow"
  const now = new Date(currentDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const dayDifference = Math.round((startOfTarget - startOfToday) / msPerDay);
  
  // Exact millisecond difference for overdue check
  const isPastExact = targetDate.getTime() < now.getTime();
  const isCompleted = task.status === 'completed';

  let label = '';
  let badgeClass = '';
  let isOverdue = false;
  let isToday = false;
  let isTomorrow = false;

  if (isCompleted) {
    label = 'Completed';
    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (dayDifference < 0 || (dayDifference === 0 && isPastExact)) {
    isOverdue = true;
    const daysAgo = Math.max(1, Math.abs(dayDifference));
    label = daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`;
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (dayDifference === 0) {
    isToday = true;
    label = 'Due today';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
  } else if (dayDifference === 1) {
    isTomorrow = true;
    label = 'Tomorrow';
    badgeClass = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
  } else {
    label = `${dayDifference} days remaining`;
    badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return {
    isCompleted,
    isOverdue,
    isToday,
    isTomorrow,
    dayDifference,
    targetDate,
    label,
    badgeClass,
  };
}

export function formatReadableDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
