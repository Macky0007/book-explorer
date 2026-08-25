import { getCoverUrl } from '../api/openLibrary';
import './BookCard.css';

/**
 * BookCard renders a single search result.
 *
 * Props (data flows down from App -> BookList -> BookCard):
 *  - book:     object   one "doc" from the Open Library search response
 *  - onSelect: fn(book) called when the card is clicked/activated,
 *                       which App uses to open the details view
 */
export default function BookCard({ book, onSelect }) {
  const coverUrl = getCoverUrl(book.cover_i);
  const authors = book.author_name?.length ? book.author_name.join(', ') : 'Unknown author';
  const year = book.first_publish_year ?? 'Year unknown';

  const activate = () => onSelect(book);

  return (
    <article
      className="book-card"
      onClick={activate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      }}
      aria-label={`View details for ${book.title}`}
    >
      <div className="book-card__cover">
        {/* Graceful fallback for books with no cover image */}
        {coverUrl ? (
          <img src={coverUrl} alt={`Cover of ${book.title}`} loading="lazy" />
        ) : (
          <div className="book-card__cover-placeholder">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 5.5A2.5 2.5 0 016.5 3H19a1 1 0 011 1v15a1 1 0 01-1 1H6.5A2.5 2.5 0 014 17.5v-12z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M4 17.5A2.5 2.5 0 016.5 15H20" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span>{book.title}</span>
          </div>
        )}
      </div>

      <div className="book-card__content">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{authors}</p>
        <p className="book-card__year">{year}</p>
      </div>
    </article>
  );
}
