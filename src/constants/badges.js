// Badge definitions: id, name, description, icon (Feather icon name), criteria.
//   minCompletedTasks       - minimum number of completed task/quiz items
//   minStreak               - minimum current streak length
//   requiresQuizCompletion  - true if at least one completed item is a quiz

export const BADGES = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Completed your first preparedness task',
    icon: 'award',
    criteria: { minCompletedTasks: 1 },
  },
  {
    id: 'on_a_roll',
    name: 'On a Roll',
    description: 'Maintained a 3-day streak',
    icon: 'zap',
    criteria: { minStreak: 3 },
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Passed your first quiz',
    icon: 'book-open',
    criteria: { requiresQuizCompletion: true },
  },
];

export const getBadgeById = (id) => BADGES.find((badge) => badge.id === id);
