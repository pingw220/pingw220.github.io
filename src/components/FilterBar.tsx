import { useEffect, useMemo, useState } from 'react';

/**
 * Client-side filter bar for lists rendered by Astro.
 *
 * The list itself stays server-rendered: each card carries `data-filter-item`
 * plus one data attribute per filter group (e.g. `data-tags="amt|evaluation"`,
 * multiple values separated by `|`). This component only toggles visibility,
 * so content remains crawlable and there is no markup duplication.
 */

export interface FilterGroup {
  /** Must match the card's data attribute name, e.g. 'tags' → data-tags. */
  key: string;
  label: string;
  options: string[];
  /** Display text for option values (defaults to the value itself). */
  optionLabels?: Record<string, string>;
}

interface FilterBarProps {
  groups: FilterGroup[];
  /** CSS selector of the container holding the [data-filter-item] cards. */
  targetSelector: string;
  /** UI text, for translated pages. */
  labels?: { all: string; none: string; shown: string };
}

const DEFAULT_LABELS = { all: 'All', none: 'No items match the selected filters.', shown: 'shown' };

export default function FilterBar({ groups, targetSelector, labels = DEFAULT_LABELS }: FilterBarProps) {
  const [active, setActive] = useState<Record<string, string | null>>({});
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const hasActiveFilter = useMemo(() => Object.values(active).some(Boolean), [active]);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(`${targetSelector} [data-filter-item]`);
    let visible = 0;
    items.forEach((item) => {
      const matches = groups.every(({ key }) => {
        const value = active[key];
        if (!value) return true;
        const itemValues = (item.dataset[key] ?? '').split('|');
        return itemValues.includes(value);
      });
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    setVisibleCount(hasActiveFilter ? visible : null);
  }, [active, groups, targetSelector, hasActiveFilter]);

  const toggle = (key: string, value: string) => {
    setActive((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const buttonClass = (selected: boolean) =>
    [
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      selected
        ? 'border-accent-violet bg-accent-violet/15 text-accent-violet'
        : 'border-border text-muted hover:border-accent-violet/50 hover:text-foreground',
    ].join(' ');

  return (
    <div className="mb-8 flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 font-mono text-xs uppercase tracking-wider text-muted">
            {group.label}
          </span>
          <button
            type="button"
            aria-pressed={!active[group.key]}
            className={buttonClass(!active[group.key])}
            onClick={() => setActive((prev) => ({ ...prev, [group.key]: null }))}
          >
            {labels.all}
          </button>
          {group.options.map((option) => {
            const selected = active[group.key] === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                className={buttonClass(selected)}
                onClick={() => toggle(group.key, option)}
              >
                {group.optionLabels?.[option] ?? option}
              </button>
            );
          })}
        </div>
      ))}
      <p aria-live="polite" className="min-h-4 text-xs text-muted">
        {visibleCount !== null &&
          (visibleCount === 0 ? labels.none : `${visibleCount} ${labels.shown}`)}
      </p>
    </div>
  );
}
