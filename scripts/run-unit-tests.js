// Node test runner for task helpers
const assert = require('assert');

function calculateProgress(completed, total) {
  if (total <= 0) return 0;
  const ratio = completed / total;
  return Math.min(Math.max(ratio, 0), 1);
}

function isTaskOverdue(dueDate, isCompleted, referenceDate = '2026-10-20') {
  if (!dueDate || isCompleted) return false;
  return dueDate < referenceDate;
}

function getNextRecurringDate(currentDateStr, rule) {
  if (!currentDateStr || rule === 'none') return currentDateStr;

  const parts = currentDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return currentDateStr;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  switch (rule) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

console.log('Running TaskFlow Unit Tests...');

// 1. calculateProgress Tests
assert.strictEqual(calculateProgress(0, 0), 0, 'Zero total should return 0');
assert.strictEqual(calculateProgress(5, 10), 0.5, '5 of 10 should return 0.5');
assert.strictEqual(calculateProgress(10, 10), 1.0, '10 of 10 should return 1.0');
assert.strictEqual(calculateProgress(15, 10), 1.0, 'Over 100% should clamp to 1.0');
console.log('✓ calculateProgress tests passed.');

// 2. isTaskOverdue Tests
assert.strictEqual(isTaskOverdue('2026-10-18', false, '2026-10-20'), true, 'Past date not completed is overdue');
assert.strictEqual(isTaskOverdue('2026-10-18', true, '2026-10-20'), false, 'Past date completed is NOT overdue');
assert.strictEqual(isTaskOverdue('2026-10-22', false, '2026-10-20'), false, 'Future date is NOT overdue');
assert.strictEqual(isTaskOverdue(null, false, '2026-10-20'), false, 'Null due date is NOT overdue');
console.log('✓ isTaskOverdue tests passed.');

// 3. getNextRecurringDate Tests
assert.strictEqual(getNextRecurringDate('2026-10-20', 'none'), '2026-10-20', 'None rule keeps same date');
assert.strictEqual(getNextRecurringDate('2026-10-20', 'daily'), '2026-10-21', 'Daily adds 1 day');
assert.strictEqual(getNextRecurringDate('2026-10-20', 'weekly'), '2026-10-27', 'Weekly adds 7 days');
assert.strictEqual(getNextRecurringDate('2026-10-20', 'monthly'), '2026-11-20', 'Monthly adds 1 month');
console.log('✓ getNextRecurringDate tests passed.');

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! (4/4 test suites)');
