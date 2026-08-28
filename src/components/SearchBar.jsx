import { useEffect, useRef, useState } from 'react';
import SearchSuggestions from './SearchSuggestions';
import { getSuggestions } from '../api/openLibrary';
import './SearchBar.css';

// How long to wait after the user stops typing before fetching suggestions.
const SUGGESTION_DEBOUNCE_MS = 300;

/**
 * SearchBar is a controlled component for the main query input: its
 * displayed value always comes from the `value` prop (owned by App's
 * state), and every keystroke is reported back up via `onChange`. It does,
 * however, own the *autocomplete dropdown's* state locally — suggestions
 * are a self-contained UI concern that nothing outside this component
 * needs to know about.
 *
 * Props (passed down from App — parent -> child props flow):
 *  - value:    string   current text in the input (controlled by App state)
 *  - onChange: fn(str)  called on every keystroke
 *  - onSubmit: fn(str)  called with the trimmed query to run a search
 *  - disabled: bool     disables the input/button while a search is in flight
 */
export default function SearchBar({ value, onChange, onSubmit, disabled }) {
  // ---- State: autocomplete dropdown --------------------------------------
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // ---- Refs ---------------------------------------------------------------
  // Wraps the input + dropdown so we can detect clicks that land *outside*
  // both of them and close the dropdown in response.
  const wrapperRef = useRef(null);
  // Holds the pending debounce timer id so a new keystroke can cancel the
  // previous one before it fires.
  const debounceTimerRef = useRef(null);

  // ---- Effect: debounced suggestion fetch ---------------------------------
  // Runs on every `value` change, but the actual network request only fires
  // 300ms after the user stops typing, thanks to the timer in debounceTimerRef.
  useEffect(() => {
    // A new keystroke arrived before the previous timer fired — cancel it.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = value.trim();
    if (!trimmed) {
      // Dropdown closes when the input is cleared.
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const controller = new AbortController();
    debounceTimerRef.current = setTimeout(() => {
      getSuggestions(trimmed, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setSuggestionsOpen(results.length > 0);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          // Suggestions are a nice-to-have, not the main search — fail quietly.
          setSuggestions([]);
        });
    }, SUGGESTION_DEBOUNCE_MS);

    // Cleanup: if `value` changes again (or the component unmounts) before
    // the timer fires, cancel both the timer and any in-flight request.
    return () => {
      clearTimeout(debounceTimerRef.current);
      controller.abort();
    };
  }, [value]);

    // ---- Effect: close dropdown on outside click ----------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    // ---- Effect: clear dropdown once a search starts loading ---------------
  // Handles cases where a search is triggered from *outside* this
  // component's own runSearch — e.g. the "suggested searches" chips on
  // the idle screen, which set App's query/submittedQuery directly.
  // We clear `suggestions` itself (not just close the dropdown) so that
  // focusing the input again later — while results are showing — can't
  // reopen it with stale data via the input's onFocus handler below.
  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  }, [disabled]);

  // ---- Event handling -------------------------------------------------------
  const runSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSuggestionsOpen(false);
    onSubmit(trimmed);
  };

  // Enter-to-search works "for free" here because the input lives inside a
  // <form> and Enter triggers a native form submit, which fires onSubmit.
  const handleFormSubmit = (event) => {
    event.preventDefault();
    runSearch(value);
  };

  const handleSelectSuggestion = (title) => {
    onChange(title);
    runSearch(title);
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleFormSubmit} role="search">
        <span className="search-bar__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 11-13.333 0 6.667 6.667 0 0113.333 0z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Controlled input: value + onChange are wired to React state in App */}
        <input
          type="text"
          className="search-bar__input"
          placeholder="Search by title or author..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
          disabled={disabled}
          aria-label="Search books by title or author"
          role="combobox"
          aria-expanded={suggestionsOpen}
          aria-autocomplete="list"
        />

        <button
          type="submit"
          className="search-bar__button"
          disabled={disabled || !value.trim()}
        >
          Search
        </button>
      </form>

      {/* Conditional rendering: dropdown only mounts while there's something to show */}
      {suggestionsOpen && (
        <SearchSuggestions suggestions={suggestions} onSelect={handleSelectSuggestion} />
      )}
    </div>
  );
}
