import { useEffect, useState } from 'react';
import { getBookDetails, getCoverUrl } from '../api/openLibrary';
import './BookDetails.css';

/**
 * BookDetails is a modal shown when a BookCard is clicked. It receives the
 * already-known summary data as a prop, and independently fetches richer
 * data (synopsis, genres, edition count) via a second API call keyed off
 * `book.key` (the work id, e.g. "/works/OL27448W").
 *
 * Props:
 *  - book:    object  the search-result doc that was clicked
 *  - onClose: fn()    called to dismiss the modal
 */
export default function BookDetails({ book, onClose }) {
  // Local state for the second fetch's lifecycle: data / loading / error
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect: runs whenever a different book is opened (book.key changes),
  // fetches its work details, and cleans up (aborts) if the modal closes
  // or a new book is selected before the request finishes.
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setDetails(null);

    getBookDetails(book.key, controller.signal)
      .then((result) => setDetails(result))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Could not load extra details for this book right now.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [book.key]);

  // Small UX nicety: close on Escape.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const coverUrl = getCoverUrl(book.cover_i, 'L');
  const authors = book.author_name?.length ? book.author_name.join(', ') : 'Unknown author';
  const editionCount = details?.editionCount ?? book.edition_count ?? null;

  return (
    <div className="book-details__overlay" onClick={onClose}>
      <div
        className="book-details__modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${book.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="book-details__close" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        <div className="book-details__cover-panel">
          {coverUrl ? (
            <img src={coverUrl} alt={`Cover of ${book.title}`} className="book-details__cover" />
          ) : (
            <div className="book-details__cover book-details__cover--placeholder">
              <span>{book.title}</span>
            </div>
          )}
        </div>

        <div className="book-details__body">
          {book.first_publish_year && (
            <p className="book-details__eyebrow">FIRST PUBLISHED • {book.first_publish_year}</p>
          )}
          <h2 className="book-details__title">{book.title}</h2>
          <p className="book-details__author">by {authors}</p>

          <div className="book-details__metrics">
            <span>{editionCount ?? '—'} editions</span>
          </div>

          {/* Conditional rendering: loading / error / loaded content */}
          {loading && (
            <div className="book-details__status" role="status">
              <div className="spinner" />
              <p>Loading more details…</p>
            </div>
          )}

          {!loading && error && (
            <p className="book-details__status book-details__status--error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && details && (
            <>
              {details.subjects.length > 0 && (
                <div className="book-details__section">
                  <h3>Genres</h3>
                  <div className="book-details__chips">
                    {details.subjects.slice(0, 6).map((subject) => (
                      <span key={subject} className="book-details__chip">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="book-details__section">
                <h3>Synopsis</h3>
                <p className="book-details__synopsis">
                  {details.description ?? 'No synopsis available for this title.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
