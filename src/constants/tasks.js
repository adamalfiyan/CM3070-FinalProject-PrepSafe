// Task/quiz definitions: id, title, type ('task'|'quiz'), xp, category (quizzes add question/options/correct).

export const XP_PER_TASK = 10;
export const XP_PER_QUIZ = 25;

export const TASKS = [
  {
    id: 'task_1',
    title: 'Check smoke alarm batteries',
    type: 'task',
    xp: XP_PER_TASK,
    category: 'home_safety',
    description:
      'Test each smoke alarm in your home and replace any batteries that are low or dead.',
  },
  {
    id: 'task_2',
    title: 'Locate nearest emergency exit at home',
    type: 'task',
    xp: XP_PER_TASK,
    category: 'evacuation',
    description:
      'Walk through your home and identify the quickest safe exit route from each room.',
  },
  {
    id: 'task_3',
    title: 'Save local emergency number in phone',
    type: 'task',
    xp: XP_PER_TASK,
    category: 'contacts',
    description:
      'Add your local emergency services number to your phone contacts for fast access.',
  },
  {
    id: 'task_4',
    title: 'Prepare 3-day water supply (3L per person per day)',
    type: 'task',
    xp: XP_PER_TASK,
    category: 'supplies',
    description:
      'Store at least 3 litres of water per person per day for a minimum of three days.',
  },
  {
    id: 'task_5',
    title: 'Identify a household meeting point',
    type: 'task',
    xp: XP_PER_TASK,
    category: 'planning',
    description:
      'Agree on a safe meeting point where your household will gather after an emergency.',
  },
  {
    id: 'quiz_1',
    title: 'What is the correct first action during an earthquake?',
    type: 'quiz',
    xp: XP_PER_QUIZ,
    category: 'home_safety',
    description: 'Test your knowledge of earthquake safety.',
    question: 'What is the correct first action during an earthquake?',
    options: [
      { key: 'A', text: 'Run outside' },
      { key: 'B', text: 'Drop, cover, hold on' },
      { key: 'C', text: 'Call emergency services' },
      { key: 'D', text: 'Open all windows' },
    ],
    correct: 'B',
  },
  {
    id: 'quiz_2',
    title: 'How many days of supplies should an emergency kit contain?',
    type: 'quiz',
    xp: XP_PER_QUIZ,
    category: 'supplies',
    description: 'Test your knowledge of emergency kit planning.',
    question: 'How many days of supplies should an emergency kit contain?',
    options: [
      { key: 'A', text: '1 day' },
      { key: 'B', text: '3 days' },
      { key: 'C', text: '7 days' },
      { key: 'D', text: '14 days' },
    ],
    correct: 'B',
  },
];

export const ACTIVE_TASKS = TASKS.filter((item) => item.type === 'task');
export const QUIZZES = TASKS.filter((item) => item.type === 'quiz');

export const getTaskById = (id) => TASKS.find((item) => item.id === id);
