export interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  lessons: string[];
}

export const paths: LearningPath[] = [
  {
    id: 'dsa-foundations',
    title: 'Data Structures & Algorithms',
    description:
      'Understand how data is organized. Learn to reason about the work your code does.',
    subject: 'dsa',
    lessons: ['dsa/arrays', 'dsa/hash-maps'],
  },
];
