// functions for XP, streak, and badge logic (unit-tested in __tests__)

import { BADGES } from '../constants/badges';
import { getTaskById } from '../constants/tasks';
import { XP_PER_TASK, XP_PER_QUIZ } from '../constants/tasks';

const MS_PER_HOUR = 1000 * 60 * 60;

// calculateXP: returns the new XP total after completing a task or quiz.
export function calculateXP(currentXP, taskType) {
  if (taskType === 'quiz') {
    return currentXP + XP_PER_QUIZ;
  }
  return currentXP + XP_PER_TASK;
}

// calculateStreak: extends within 24-48h, resets after 48h, unchanged under 24h, starts at 1 if no prior completion.
export function calculateStreak(lastCompletionTimestamp, currentStreak, now = Date.now()) {
  if (lastCompletionTimestamp == null) {
    return 1;
  }

  const hoursElapsed = (now - lastCompletionTimestamp) / MS_PER_HOUR;

  if (hoursElapsed < 24) {
    // Same-day repeat: do not increment.
    return currentStreak;
  }

  if (hoursElapsed <= 48) {
    // Completed on the following day: extend the streak.
    return currentStreak + 1;
  }

  // More than 48 hours: the streak has lapsed and restarts at 1.
  return 1;
}

// evaluateBadges: returns newly earned badge IDs by checking each badge's criteria.
export function evaluateBadges(completedTaskIds, currentStreak, earnedBadgeIds) {
  const hasQuizCompletion = completedTaskIds.some((id) => {
    const item = getTaskById(id);
    return item != null && item.type === 'quiz';
  });

  const newlyEarned = [];

  BADGES.forEach((badge) => {
    if (earnedBadgeIds.includes(badge.id)) {
      return;
    }

    const { criteria } = badge;
    let earned = true;

    if (
      criteria.minCompletedTasks != null &&
      completedTaskIds.length < criteria.minCompletedTasks
    ) {
      earned = false;
    }

    if (criteria.minStreak != null && currentStreak < criteria.minStreak) {
      earned = false;
    }

    if (criteria.requiresQuizCompletion && !hasQuizCompletion) {
      earned = false;
    }

    if (earned) {
      newlyEarned.push(badge.id);
    }
  });

  return newlyEarned;
}
