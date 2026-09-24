// Unit tests for src/utils/gamification.js: XP, streak, and badge evaluation.

import {
  calculateXP,
  calculateStreak,
  evaluateBadges,
} from '../src/utils/gamification';

const HOUR = 1000 * 60 * 60;

describe('calculateXP', () => {
  test('awards 10 XP for a task', () => {
    expect(calculateXP(0, 'task')).toBe(10);
    expect(calculateXP(40, 'task')).toBe(50);
  });

  test('awards 25 XP for a quiz', () => {
    expect(calculateXP(0, 'quiz')).toBe(25);
    expect(calculateXP(100, 'quiz')).toBe(125);
  });

  test('defaults to task reward for unknown type', () => {
    expect(calculateXP(0, 'something_else')).toBe(10);
  });
});

describe('calculateStreak', () => {
  const now = 1_700_000_000_000; // fixed reference clock

  test('first completion (null timestamp) starts streak at 1', () => {
    expect(calculateStreak(null, 0, now)).toBe(1);
    expect(calculateStreak(undefined, 0, now)).toBe(1);
  });

  test('same-day repeat (<24h) does not increment', () => {
    const last = now - 5 * HOUR;
    expect(calculateStreak(last, 4, now)).toBe(4);
  });

  test('next-day completion (24-48h) increments the streak', () => {
    const last = now - 30 * HOUR;
    expect(calculateStreak(last, 4, now)).toBe(5);
  });

  test('exactly 24h boundary increments', () => {
    const last = now - 24 * HOUR;
    expect(calculateStreak(last, 2, now)).toBe(3);
  });

  test('lapsed completion (>48h) resets streak to 1', () => {
    const last = now - 72 * HOUR;
    expect(calculateStreak(last, 9, now)).toBe(1);
  });
});

describe('evaluateBadges', () => {
  test("'first_steps' awarded on first completed task", () => {
    const earned = evaluateBadges(['task_1'], 1, []);
    expect(earned).toContain('first_steps');
  });

  test("'on_a_roll' awarded at a 3-day streak", () => {
    const earned = evaluateBadges(['task_1'], 3, ['first_steps']);
    expect(earned).toContain('on_a_roll');
    expect(earned).not.toContain('first_steps'); // already earned
  });

  test("'on_a_roll' not awarded below a 3-day streak", () => {
    const earned = evaluateBadges(['task_1'], 2, ['first_steps']);
    expect(earned).not.toContain('on_a_roll');
  });

  test("'quiz_master' awarded when a quiz is completed", () => {
    const earned = evaluateBadges(['quiz_1'], 1, []);
    expect(earned).toContain('quiz_master');
  });

  test("'quiz_master' not awarded for tasks only", () => {
    const earned = evaluateBadges(['task_1', 'task_2'], 1, []);
    expect(earned).not.toContain('quiz_master');
  });

  test('does not re-award already earned badges', () => {
    const earned = evaluateBadges(['task_1'], 1, ['first_steps']);
    expect(earned).not.toContain('first_steps');
  });

  test('edge case: earns both first_steps and quiz_master in one session', () => {
    const earned = evaluateBadges(['quiz_1'], 1, []);
    expect(earned).toEqual(expect.arrayContaining(['first_steps', 'quiz_master']));
    expect(earned).not.toContain('on_a_roll');
  });

  test('edge case: all three badges earned together at a 3-day streak with a quiz', () => {
    const earned = evaluateBadges(['task_1', 'quiz_1'], 3, []);
    expect(earned).toEqual(
      expect.arrayContaining(['first_steps', 'on_a_roll', 'quiz_master'])
    );
  });

  test('returns empty array when no new criteria are met', () => {
    const earned = evaluateBadges([], 0, []);
    expect(earned).toEqual([]);
  });
});
