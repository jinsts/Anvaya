// Pure practice logic shared by the problem tracker, mock interview and drill.

export interface ProblemFacts {
  text: string;
  difficulty: string;
  lessons: string[];
  lists: string[];
}

export interface ProblemFilters {
  query: string;
  /** '' for all, `subject:<id>` for a subject, or a lesson ID. */
  lesson: string;
  difficulty: string;
  list: string;
  status: string;
}

export const emptyFilters: ProblemFilters = {
  query: '',
  lesson: '',
  difficulty: '',
  list: '',
  status: '',
};

export function matchesProblem(
  facts: ProblemFacts,
  filters: ProblemFilters,
  status: string,
) {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  const lessonMatch = filters.lesson.startsWith('subject:')
    ? facts.lessons.some((id) =>
        id.startsWith(`${filters.lesson.slice('subject:'.length)}/`),
      )
    : !filters.lesson || facts.lessons.includes(filters.lesson);
  return (
    terms.every((term) => facts.text.includes(term)) &&
    lessonMatch &&
    (!filters.difficulty || facts.difficulty === filters.difficulty) &&
    (!filters.list || facts.lists.includes(filters.list)) &&
    (!filters.status || status === filters.status)
  );
}

/** Stable question ID: lesson plus a slug of the prompt. */
export function questionId(lessonId: string, prompt: string) {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-$/, '');
  return `${lessonId}#${slug}`;
}

type Result = { result: 'known' | 'again'; at: string };

/** Review-again first (oldest first), then unseen in order, then known (oldest first). */
export function orderQuestions<T extends { id: string }>(
  items: T[],
  results: Record<string, Result>,
) {
  const rank = (item: T) =>
    !results[item.id] ? 1 : results[item.id]!.result === 'again' ? 0 : 2;
  const time = (item: T) => Date.parse(results[item.id]?.at ?? '') || 0;
  return items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        rank(a.item) - rank(b.item) ||
        time(a.item) - time(b.item) ||
        a.index - b.index,
    )
    .map(({ item }) => item);
}

export function formatClock(milliseconds: number) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function pickRandom<T>(items: T[], random = Math.random) {
  return items.length ? items[Math.floor(random() * items.length)] : undefined;
}
