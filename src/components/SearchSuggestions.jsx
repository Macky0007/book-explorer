import './SearchSuggestions.css';

/**
 * Dropdown list of recommended search terms rendered under SearchBar's
 * input. This component is intentionally "dumb": all the debouncing,
 * fetching, and open/close logic lives in SearchBar — this just displays
 * whatever list it's handed and reports which one was clicked.
 *
 * Props:
 *  - suggestions: array<{ title: string, author: string|null }>
 *  - onSelect:    fn(title) called with the clicked suggestion's title
 */
export default function SearchSuggestions({ suggestions, onSelect }) {
  return (
    <ul className="search-suggestions" role="listbox">
      {suggestions.map((item, index) => (
        // Titles aren't guaranteed unique across different books, so the
        // list index is folded into the key alongside the title.
        <li key={`${item.title}-${index}`} role="presentation">
          <button
            type="button"
            className="search-suggestions__item"
            role="option"
            // Suggestion buttons live outside the <input>, so a plain click
            // would blur the input first (firing the outside-click handler)
            // before the click itself registers. Preventing the mousedown's
            // default behaviour keeps focus in place so onClick still fires
            // on the intended item.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item.title)}
          >
            <span className="search-suggestions__title">{item.title}</span>
            {item.author && <span className="search-suggestions__author">{item.author}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
