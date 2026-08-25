import BookCard from './BookCard';
import SkeletonCard from './SkeletonCard';
import './BookList.css';

// Number of skeleton placeholders to show while a search is loading.
// Fixed at 8 so the loading grid has a consistent, full-looking shape
// regardless of how many real results eventually come back.
const SKELETON_COUNT = 8;

/**
 * BookList renders the results grid. It has two mutually exclusive modes,
 * switched with a conditional early return:
 *  - loading: render SKELETON_COUNT placeholder cards
 *  - otherwise: map `books` to real BookCard components
 *
 * Props:
 *  - books:        array    the results to render (ignored while loading)
 *  - onSelectBook: fn(book) forwarded to each BookCard
 *  - loading:      bool     when true, render skeletons instead of books
 */
export default function BookList({ books, onSelectBook, loading }) {
  if (loading) {
    return (
      <div className="book-list">
        {/* Skeleton cards have no identity of their own, so index is a fine key here */}
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="book-list">
      {books.map((book) => (
        // book.key is Open Library's stable work id (e.g. "/works/OL27448W")
        <BookCard key={book.key} book={book} onSelect={onSelectBook} />
      ))}
    </div>
  );
}
