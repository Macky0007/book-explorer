import './SkeletonCard.css';

/**
 * Placeholder card shown in BookList while a search is in flight, in place
 * of a real BookCard. It deliberately mirrors BookCard's DOM shape (cover
 * block, title line, author line, year line) so the grid doesn't jump or
 * reflow once real results swap in.
 *
 * No props, no state — this is a purely presentational component.
 * `aria-hidden` keeps screen readers from announcing 8 empty cards; the
 * "Searching…" text rendered alongside the grid is the accessible status.
 */
export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__cover" />
      <div className="skeleton-card__line skeleton-card__line--title" />
      <div className="skeleton-card__line skeleton-card__line--author" />
      <div className="skeleton-card__line skeleton-card__line--year" />
    </div>
  );
}
