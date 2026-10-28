export interface Category {
  id: string;
  title: string;
  description: string;
  parent?: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  category: string;
}

// Add categories when there is something to study in them. The model is shared
// by every field of learning; the current library contains only these lessons.
export const categories: Category[] = [
  {
    id: 'technology',
    title: 'Technology & Engineering',
    description: 'Understand the ideas behind the systems we build.',
  },
  {
    id: 'computer-science',
    title: 'Computer Science',
    description:
      'Explore computation, data, and the reasoning behind programs.',
    parent: 'technology',
  },
];

export const subjects: Subject[] = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description:
      'Build a mental model of how data is organized and what it costs to work with it.',
    category: 'computer-science',
  },
];
