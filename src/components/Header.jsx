import './Header.css';
import logo from '../assets/libraryBackgroundLogo-removebg-preview.png';

/**
 * Site header, shown on every screen. This was previously inlined directly
 * inside App.jsx — pulling it out into its own component matches the rest
 * of the app's structure (one file per UI piece) and makes the reset
 * behaviour easy to find and test in isolation.
 *
 * Props (a single event handler flows down from App — "props down"):
 *  - onReset: fn() called when the logo/title is clicked. App owns what
 *             "reset" actually means (clearing query/results/details), so
 *             Header just reports the click and lets the parent decide.
 */
export default function Header({ onReset }) {
  return (
    <header className="header">
      {/* A real <button> (not a styled <span>/<a href="#">) so this is
          reachable and activatable via keyboard, and clicking it can't
          also trigger an unwanted page navigation. */}
        <button
        type="button"
        className="header__logo"
        onClick={onReset}
        aria-label="MackBook home — reset search"
      >
        <img src={logo} alt="" className="header__logo-image" />
        <span className="header__logo-text">MACKBOOK</span>
      </button>

      <nav className="header__nav">
        <a href="#" className="header__nav-link header__nav-link--active">
          Discover
        </a>
      </nav>
    </header>
  );
}
