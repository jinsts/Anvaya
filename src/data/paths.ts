export interface PathSection {
  id: string;
  title: string;
  lessons: string[];
}

interface LearningPathDetails {
  id: string;
  title: string;
  description: string;
  subject: string;
}

// Store order once: a short path can be flat, a longer path can group its lessons.
export type LearningPath = LearningPathDetails &
  (
    | { lessons: string[]; sections?: never }
    | { sections: PathSection[]; lessons?: never }
  );

export const paths: LearningPath[] = [
  {
    id: 'dsa-foundations',
    title: 'Data Structures & Algorithms',
    description:
      'Understand how data is organized. Learn to reason about the work your code does.',
    subject: 'dsa',
    sections: [
      {
        id: 'foundations',
        title: 'Foundations',
        lessons: ['dsa/arrays', 'dsa/hash-maps'],
      },
    ],
  },
];
