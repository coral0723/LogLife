"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  fetchPlacesAutocomplete,
  fetchPlaceDetails,
  type NormalizedPlace,
  type Suggestion,
} from "@/api/places";

export type { NormalizedPlace };

type Props = {
  onSelect: (place: NormalizedPlace) => void;
  placeholder?: string;
  languageCode?: string;
  regionCode?: string;
};

const DEBOUNCE_MS = 300;

export function PlacesAutocomplete({
  onSelect,
  placeholder = "장소 검색",
  languageCode = "ko",
  regionCode,
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const skipNextFetchRef = useRef(false);
  const listboxId = useId();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setError(null);
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    const ac = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPlacesAutocomplete(
          trimmed,
          sessionTokenRef.current,
          languageCode,
          regionCode,
          ac.signal,
        );
        setSuggestions(data.suggestions);
        setActiveIndex(-1);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setSuggestions([]);
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, languageCode, regionCode]);

  const pick = useCallback(
    async (suggestion: Suggestion) => {
      setError(null);
      setIsLoading(true);
      try {
        const place = await fetchPlaceDetails(
          suggestion.placeId,
          sessionTokenRef.current,
          languageCode,
        );
        onSelect(place);
        sessionTokenRef.current = crypto.randomUUID();
        skipNextFetchRef.current = true;
        setQuery(suggestion.text);
        setSuggestions([]);
        setActiveIndex(-1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [onSelect, languageCode],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? suggestions.length - 1 : i - 1,
      );
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        void pick(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const isOpen = suggestions.length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none"
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                void pick(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === activeIndex ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              {s.text}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
      {isLoading && !error && (
        <p className="mt-1 text-xs text-zinc-400">검색 중…</p>
      )}
    </div>
  );
}
