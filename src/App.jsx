import { useEffect, useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookList from './components/BookList';
import BookDetails from './components/BookDetails';
import { searchBooks } from './api/openLibrary';
import './App.css';

// The four UI states this screen can be in, driven by one `status` value
// instead of a loose collection of booleans (avoids impossible states like
// "loading" and "error" being true at the same time).
const SUGGESTED_SEARCHES = ['Dune', 'Harry Potter', 'Agatha Christie', 'The Hobbit', 'Sci-Fi'];
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export default function App() {
  // ---- State ----------------------------------------------------------
  const [query, setQuery] = useState('');               // controlled search input value
  const [submittedQuery, setSubmittedQuery] = useState(''); // the query that was actually searched
  const [books, setBooks] = useState([]);                // results array
  const [status, setStatus] = useState(STATUS.IDLE);     // loading / error / empty / results
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBook, setSelectedBook] = useState(null); // book shown in the details modal
  // Bumped by the Retry button to re-run the effect below for the *same*
  // submittedQuery (changing submittedQuery alone wouldn't re-trigger the
  // effect, since React skips effects whose dependencies didn't change).
  const [retryToken, setRetryToken] = useState(0);

  // ---- Effects ----------------------------------------------------------
  // useEffect triggers the fetch whenever a new search is submitted (or a
  // failed one is retried). It's keyed on `submittedQuery` (not `query`)
  // so typing doesn't fire a request on every keystroke — only actual
  // submissions do.
  useEffect(() => {
    if (!submittedQuery) return;

    const controller = new AbortController();
    setStatus(STATUS.LOADING);
    setErrorMessage('');

    searchBooks(submittedQuery, controller.signal)
      .then((results) => {
        setBooks(results);
        setStatus(STATUS.SUCCESS);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // a newer search superseded this one
        setBooks([]);
        setStatus(STATUS.ERROR);
        setErrorMessage('Something went wrong while fetching books. Please try again.');
      });

    // Cleanup: cancel this request if the query changes again before it resolves
    return () => controller.abort();
  }, [submittedQuery, retryToken]);

  const handleSearch = (value) => setSubmittedQuery(value);
  const handleRetry = () => setRetryToken((token) => token + 1);
  const handleSuggestedSearch = (term) => {
    setQuery(term);
    setSubmittedQuery(term);
  };

  // Logo/title click: clears everything and returns to the starting view.
  // Lives in App because App is the single owner of all this state —
  // Header just reports the click, it doesn't decide what "reset" means.
  const handleReset = () => {
    setQuery('');
    setSubmittedQuery('');
    setBooks([]);
    setStatus(STATUS.IDLE);
    setErrorMessage('');
    setSelectedBook(null);
  };

  return (
    <div className="app">
      <Header onReset={handleReset} />

      <main className="app__main">
        <h1 className="app__title">Find your next great read</h1>

        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          disabled={status === STATUS.LOADING}
        />

        <section className="app__results">
          {/* Conditional rendering: exactly one of these blocks renders per status */}

          {status === STATUS.IDLE && (
            <div className="app__suggestions">
              <p className="app__hint app__hint--center">
                Search for a title or author to get started, or try one of these:
              </p>
              <div className="app__suggestion-chips">
                {SUGGESTED_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="app__suggestion-chip"
                    onClick={() => handleSuggestedSearch(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === STATUS.LOADING && (
            <div className="app__results-panel">
              <p className="app__results-count" role="status">
                Searching for “{submittedQuery}”…
              </p>
              {/* Skeleton cards matching BookCard's layout, instead of a plain spinner */}
              <BookList loading />
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="app__status app__status--error" role="alert">
              <p>{errorMessage}</p>
              <button type="button" className="app__retry-button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {status === STATUS.SUCCESS && books.length === 0 && (
            <div className="app__status">
              <h2>No books found.</h2>
              <p className="app__hint">
                Try searching for a different title or author, or check for typos.
              </p>
            </div>
          )}

          {status === STATUS.SUCCESS && books.length > 0 && (
            <div className="app__results-panel">
              <p className="app__results-count">
                Showing {books.length} result{books.length === 1 ? '' : 's'} for “{submittedQuery}”
              </p>
              {/* Props: books + a selection callback flow down to BookList/BookCard */}
              <BookList books={books} onSelectBook={setSelectedBook} />
            </div>
          )}
        </section>
      </main>

      {/* Conditional rendering: the modal only mounts when a book is selected */}
      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}
