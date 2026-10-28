import { loadProgress, updateProgress } from './progress';
import { orderQuestions } from '../lib/practice-model';

interface Question {
  id: string;
  lesson: string;
  context: string;
  prompt: string;
  answer: string;
}

// Rebuilds a card from build-time markup; prompts and answers were escaped at build.
export function initDrill() {
  const root = document.querySelector<HTMLElement>('[data-drill]');
  if (!root) return;
  const $ = <T extends Element>(selector: string) =>
    root.querySelector<T>(selector)!;
  const filter = $<HTMLSelectElement>('[data-drill-filter]');
  const progressText = $<HTMLElement>('[data-drill-progress]');
  const card = $<HTMLElement>('[data-drill-card]');
  const context = $<HTMLElement>('[data-drill-context]');
  const prompt = $<HTMLElement>('[data-drill-prompt]');
  const answer = $<HTMLElement>('[data-drill-answer]');
  const reveal = $<HTMLButtonElement>('[data-drill-reveal]');
  const results = [
    ...root.querySelectorAll<HTMLButtonElement>('[data-drill-result]'),
  ];
  const done = $<HTMLElement>('[data-drill-done]');
  const status = $<HTMLElement>('[data-drill-status]');
  const questions: Question[] = [
    ...document.querySelectorAll<HTMLDetailsElement>('details[data-question]'),
  ].map((item) => ({
    id: item.dataset.question!,
    lesson: item.dataset.lesson!,
    context: item.dataset.context ?? '',
    prompt: item.querySelector('summary')?.innerHTML ?? '',
    answer: item.querySelector('.answer')?.innerHTML ?? '',
  }));
  let queue: Question[] = [];
  let position = 0;

  const matches = (question: Question) =>
    !filter.value ||
    (filter.value.startsWith('subject:')
      ? question.lesson.startsWith(`${filter.value.slice('subject:'.length)}/`)
      : question.lesson === filter.value);

  function render() {
    const current = queue[position];
    const again = queue.filter(
      (question) => loadProgress().questions[question.id]?.result === 'again',
    ).length;
    progressText.textContent = queue.length
      ? `Question ${Math.min(position + 1, queue.length)} of ${queue.length} · ${again} marked for review`
      : 'No questions for this topic yet.';
    card.hidden = !current;
    done.hidden = Boolean(current) || !queue.length;
    if (!current) return;
    context.textContent = current.context;
    prompt.innerHTML = current.prompt;
    answer.innerHTML = current.answer;
    answer.hidden = true;
    reveal.hidden = false;
    results.forEach((button) => (button.hidden = true));
  }

  function start() {
    queue = orderQuestions(questions.filter(matches), loadProgress().questions);
    position = 0;
    render();
  }

  reveal.addEventListener('click', () => {
    answer.hidden = false;
    reveal.hidden = true;
    results.forEach((button) => (button.hidden = false));
    results.at(-1)?.focus();
    status.textContent = 'Answer revealed.';
  });
  for (const button of results) {
    button.addEventListener('click', () => {
      const current = queue[position];
      if (!current) return;
      const result = button.dataset.drillResult as 'known' | 'again';
      updateProgress((progress) => {
        progress.questions[current.id] = {
          result,
          at: new Date().toISOString(),
        };
      });
      position++;
      render();
      status.textContent =
        result === 'again' ? 'Marked for review.' : 'Marked as known.';
      (queue[position]
        ? prompt
        : $<HTMLButtonElement>('[data-drill-restart]')
      ).focus();
    });
  }
  $('[data-drill-restart]').addEventListener('click', () => {
    start();
    prompt.focus();
  });
  filter.addEventListener('change', () => {
    const url = new URL(location.href);
    if (filter.value) url.searchParams.set('lesson', filter.value);
    else url.searchParams.delete('lesson');
    history.replaceState(null, '', url);
    start();
  });

  filter.value = new URLSearchParams(location.search).get('lesson') ?? '';
  start();
}
