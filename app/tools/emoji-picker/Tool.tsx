'use client'

import { useMemo, useState } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { EMOJI_CATEGORIES, filterEmojis, MAX_QUERY_LENGTH, type EmojiFilterCategory } from './logic'

export default function Tool() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EmojiFilterCategory>('all')
  const [feedback, setFeedback] = useState<{ kind: 'status' | 'error'; message: string } | null>(null)
  const matches = useMemo(() => filterEmojis(query, category), [query, category])

  async function copyEmoji(emoji: string, name: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.')
      await navigator.clipboard.writeText(emoji)
      setFeedback({ kind: 'status', message: `${name} copied to clipboard.` })
    } catch {
      setFeedback({ kind: 'error', message: 'Could not access the clipboard. Check your browser permissions and try again.' })
    }
  }

  return (
    <div className="space-y-4">
      <ToolPanel className="p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-primary">Find an emoji</h2>
          <p className="mt-1 text-sm text-secondary">Search the curated local catalog by name, meaning, or keyword. Choose an emoji to copy it.</p>
        </div>

        <label htmlFor="emoji-picker-search" className="mb-2 block text-sm font-medium text-primary">Search emojis</label>
        <input
          id="emoji-picker-search"
          type="search"
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setFeedback(null)
          }}
          maxLength={MAX_QUERY_LENGTH}
          autoComplete="off"
          spellCheck={false}
          placeholder="Try smile, coffee, travel, or heart"
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-primary placeholder:text-secondary focus:border-[#347a58] focus:outline-none"
          aria-describedby="emoji-picker-search-hint"
        />
        <p id="emoji-picker-search-hint" className="mt-1 text-xs text-secondary">Search is limited to {MAX_QUERY_LENGTH} characters and runs entirely in this browser.</p>

        <div className="mt-4" role="group" aria-label="Filter emojis by category">
          <p className="mb-2 text-sm font-medium text-primary">Category</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={category === id}
                onClick={() => {
                  setCategory(id)
                  setFeedback(null)
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-border-focus ${category === id ? 'border-primary bg-primary text-white' : 'border-border bg-input text-secondary hover:bg-hover hover:text-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </ToolPanel>

      <ToolPanel className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-primary">Emoji results</h2>
          <span className="text-sm text-secondary" aria-live="polite">{matches.length} {matches.length === 1 ? 'emoji' : 'emojis'}</span>
        </div>
        {matches.length > 0 ? (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10" aria-label="Matching emojis">
            {matches.map(({ emoji, name }) => (
              <button
                key={`${emoji}-${name}`}
                type="button"
                aria-label={`Copy ${name} (${emoji})`}
                title={`${name} — copy emoji`}
                onClick={() => void copyEmoji(emoji, name)}
                className="flex aspect-square min-h-12 items-center justify-center rounded-xl border border-border bg-input text-2xl transition hover:border-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-secondary">No emojis match that search. Try another word or category.</p>
        )}
        <p
          className={`mt-3 min-h-6 text-sm ${feedback?.kind === 'error' ? 'text-red-600 dark:text-red-300' : 'text-secondary'}`}
          role={feedback?.kind === 'error' ? 'alert' : 'status'}
          aria-live={feedback?.kind === 'error' ? 'assertive' : 'polite'}
        >
          {feedback?.message ?? 'Select an emoji to copy it to your clipboard.'}
        </p>
      </ToolPanel>
    </div>
  )
}
