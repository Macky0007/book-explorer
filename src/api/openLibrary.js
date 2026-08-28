// Thin wrapper around the Open Library HTTP API.
// Keeping fetch logic here (rather than in components) makes the
// components easier to read and the API calls easier to reuse/mock/test.

const SEARCH_BASE = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b/id';

// Search Open Library for books matching a free-text query.
// `query` is the search text, and `signal` is an optional AbortSignal —
// pass one in if you want to be able to cancel this request later
// (e.g. the user typed something new before this search finished).
// Returns an array of matching book "docs" (raw Open Library records).
export async function searchBooks(query, signal) {
  const url = `${SEARCH_BASE}?q=${encodeURIComponent(query)}&limit=24`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Search request failed (status ${response.status})`);
  }

  const data = await response.json();
  return data.docs ?? [];
}

// Fetch extra details for a single book's "work" record: description,
// subjects/genres, and an accurate edition count. This is the "second
// API call" used to populate the details panel/modal, once the user
// clicks on a book from the search results.
// `workKey` looks like "/works/OL27448W" — it comes from a search
// result's `key` field. `signal` is optional, same as above.
export async function getBookDetails(workKey, signal) {
  const [workResponse, editionsResponse] = await Promise.all([
    fetch(`${OPEN_LIBRARY_BASE}${workKey}.json`, { signal }),
    fetch(`${OPEN_LIBRARY_BASE}${workKey}/editions.json?limit=1`, { signal }),
  ]);

  if (!workResponse.ok) {
    throw new Error(`Work details request failed (status ${workResponse.status})`);
  }

  const work = await workResponse.json();
  // Don't fail the whole details view just because the editions call hiccuped.
  const editionsData = editionsResponse.ok ? await editionsResponse.json() : null;

  // `description` can be a plain string or an object like { type, value }.
  const description =
    typeof work.description === 'string' ? work.description : work.description?.value ?? null;

  return {
    subjects: work.subjects ?? [],
    description,
    editionCount: editionsData?.size ?? null,
  };
}

// Fetch a short list of suggested search terms for the autocomplete
// dropdown. Reuses the same search endpoint as `searchBooks`, but asks for
// only a handful of results and a reduced field set — we only need enough
// to build "title — author" labels, not full book records.
// Returns an array of objects shaped like { title, author }, where
// `author` may be null if Open Library doesn't have one on file.
export async function getSuggestions(query, signal) {
  const url = `${SEARCH_BASE}?q=${encodeURIComponent(query)}&limit=5&fields=title,author_name`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Suggestions request failed (status ${response.status})`);
  }

  const data = await response.json();
  return (data.docs ?? []).map((doc) => ({
    title: doc.title,
    author: doc.author_name?.[0] ?? null,
  }));
}

// Build a cover image URL for a given Open Library cover id.
// `size` can be 'S' (small), 'M' (medium, the default), or 'L' (large).
// Returns null when there's no cover id, so callers can render a
// placeholder image instead of a broken <img>.
export function getCoverUrl(coverId, size = 'M') {
  return coverId ? `${COVERS_BASE}/${coverId}-${size}.jpg` : null;
}