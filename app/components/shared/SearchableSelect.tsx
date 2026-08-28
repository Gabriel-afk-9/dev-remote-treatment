"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  code: string;
  name: string;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Digite para buscar...",
  className = "",
}: {
  options: SelectOption[];
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => normalize(o.name).includes(normalize(query.trim())))
    : options;

  return (
    <div ref={containerRef} className={`relative w-full max-w-[20rem] ${className}`}>
      <input
        readOnly
        value={value}
        placeholder={placeholder}
        onClick={() => setOpen((v) => !v)}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="input input-bordered bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 pr-9 cursor-pointer"
      />
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none"
      />

      {open && (
        <div className="z-50 absolute left-0 right-0 mt-1 rounded-lg border border-neutral/20 bg-background shadow-lg overflow-hidden">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="px-3 py-2 w-full text-foreground placeholder:text-neutral/60 outline-none border-b border-neutral/15"
          />
          <ul role="listbox" id={listId} className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-neutral text-sm">Nenhum resultado</li>
            )}
            {filtered.map((o) => (
              <li key={o.code} role="option" aria-selected={value === o.name}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`block px-3 py-2 w-full text-left truncate hover:bg-brand/10 ${
                    value === o.name ? "text-brand font-semibold" : "text-foreground"
                  }`}
                >
                  {o.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
