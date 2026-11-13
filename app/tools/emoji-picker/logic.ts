import type { ToolOptions } from '@/app/tools/types'

export const MAX_QUERY_LENGTH = 80
export const MAX_RESULTS = 100

export const EMOJI_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'smileys', label: 'Smileys' },
  { id: 'people', label: 'People' },
  { id: 'animals', label: 'Animals' },
  { id: 'food', label: 'Food' },
  { id: 'travel', label: 'Travel' },
  { id: 'activities', label: 'Activities' },
  { id: 'objects', label: 'Objects' },
  { id: 'symbols', label: 'Symbols' },
  { id: 'flags', label: 'Flags' },
] as const

export type EmojiCategory = Exclude<(typeof EMOJI_CATEGORIES)[number]['id'], 'all'>
export type EmojiFilterCategory = (typeof EMOJI_CATEGORIES)[number]['id']

export type EmojiEntry = {
  emoji: string
  name: string
  category: EmojiCategory
  keywords: readonly string[]
}

// This intentionally bounded, hand-curated catalog covers common emoji rather than the full Unicode set.
export const EMOJI_CATALOG: readonly EmojiEntry[] = [
  { emoji: '😀', name: 'Grinning face', category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
  { emoji: '😃', name: 'Grinning face with big eyes', category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
  { emoji: '😄', name: 'Grinning face with smiling eyes', category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
  { emoji: '😁', name: 'Beaming face with smiling eyes', category: 'smileys', keywords: ['happy', 'grin'] },
  { emoji: '😆', name: 'Grinning squinting face', category: 'smileys', keywords: ['laugh', 'happy'] },
  { emoji: '😂', name: 'Face with tears of joy', category: 'smileys', keywords: ['laugh', 'funny', 'cry'] },
  { emoji: '🥹', name: 'Face holding back tears', category: 'smileys', keywords: ['touched', 'emotional', 'cry'] },
  { emoji: '😊', name: 'Smiling face with smiling eyes', category: 'smileys', keywords: ['blush', 'happy', 'warm'] },
  { emoji: '😍', name: 'Smiling face with heart eyes', category: 'smileys', keywords: ['love', 'heart', 'adore'] },
  { emoji: '😘', name: 'Face blowing a kiss', category: 'smileys', keywords: ['love', 'kiss'] },
  { emoji: '😎', name: 'Smiling face with sunglasses', category: 'smileys', keywords: ['cool', 'sun'] },
  { emoji: '🤔', name: 'Thinking face', category: 'smileys', keywords: ['think', 'question', 'hmm'] },
  { emoji: '🙄', name: 'Face with rolling eyes', category: 'smileys', keywords: ['annoyed', 'whatever'] },
  { emoji: '😴', name: 'Sleeping face', category: 'smileys', keywords: ['sleep', 'tired', 'zzz'] },
  { emoji: '😭', name: 'Loudly crying face', category: 'smileys', keywords: ['sad', 'cry', 'tears'] },
  { emoji: '🥳', name: 'Partying face', category: 'smileys', keywords: ['celebrate', 'birthday', 'party'] },
  { emoji: '🤯', name: 'Exploding head', category: 'smileys', keywords: ['mind blown', 'shock', 'wow'] },
  { emoji: '🙏', name: 'Folded hands', category: 'people', keywords: ['please', 'thanks', 'pray'] },
  { emoji: '👏', name: 'Clapping hands', category: 'people', keywords: ['applause', 'congratulations'] },
  { emoji: '🙌', name: 'Raising hands', category: 'people', keywords: ['celebrate', 'hooray'] },
  { emoji: '👋', name: 'Waving hand', category: 'people', keywords: ['hello', 'goodbye', 'wave'] },
  { emoji: '👍', name: 'Thumbs up', category: 'people', keywords: ['yes', 'like', 'approve'] },
  { emoji: '👎', name: 'Thumbs down', category: 'people', keywords: ['no', 'dislike', 'disapprove'] },
  { emoji: '💪', name: 'Flexed biceps', category: 'people', keywords: ['strong', 'strength', 'workout'] },
  { emoji: '🤝', name: 'Handshake', category: 'people', keywords: ['deal', 'agreement', 'meet'] },
  { emoji: '🫶', name: 'Heart hands', category: 'people', keywords: ['love', 'support', 'care'] },
  { emoji: '🤦', name: 'Person facepalming', category: 'people', keywords: ['oops', 'frustrated'] },
  { emoji: '🤷', name: 'Person shrugging', category: 'people', keywords: ['unsure', 'whatever', 'dunno'] },
  { emoji: '🐶', name: 'Dog face', category: 'animals', keywords: ['pet', 'puppy', 'dog'] },
  { emoji: '🐱', name: 'Cat face', category: 'animals', keywords: ['pet', 'kitten', 'cat'] },
  { emoji: '🐭', name: 'Mouse face', category: 'animals', keywords: ['rodent', 'mouse'] },
  { emoji: '🐰', name: 'Rabbit face', category: 'animals', keywords: ['bunny', 'rabbit', 'pet'] },
  { emoji: '🦊', name: 'Fox', category: 'animals', keywords: ['wildlife', 'animal'] },
  { emoji: '🐻', name: 'Bear', category: 'animals', keywords: ['wildlife', 'animal'] },
  { emoji: '🐼', name: 'Panda', category: 'animals', keywords: ['wildlife', 'bear', 'animal'] },
  { emoji: '🦁', name: 'Lion', category: 'animals', keywords: ['wildlife', 'cat', 'animal'] },
  { emoji: '🐸', name: 'Frog', category: 'animals', keywords: ['amphibian', 'animal'] },
  { emoji: '🦋', name: 'Butterfly', category: 'animals', keywords: ['insect', 'nature'] },
  { emoji: '🐢', name: 'Turtle', category: 'animals', keywords: ['reptile', 'slow', 'animal'] },
  { emoji: '🐬', name: 'Dolphin', category: 'animals', keywords: ['ocean', 'sea', 'animal'] },
  { emoji: '🍎', name: 'Red apple', category: 'food', keywords: ['fruit', 'healthy', 'food'] },
  { emoji: '🍌', name: 'Banana', category: 'food', keywords: ['fruit', 'food'] },
  { emoji: '🍉', name: 'Watermelon', category: 'food', keywords: ['fruit', 'summer', 'food'] },
  { emoji: '🍓', name: 'Strawberry', category: 'food', keywords: ['fruit', 'berry', 'food'] },
  { emoji: '🥑', name: 'Avocado', category: 'food', keywords: ['fruit', 'healthy', 'food'] },
  { emoji: '🍕', name: 'Pizza', category: 'food', keywords: ['slice', 'cheese', 'food'] },
  { emoji: '🍔', name: 'Hamburger', category: 'food', keywords: ['burger', 'fast food'] },
  { emoji: '🌮', name: 'Taco', category: 'food', keywords: ['mexican', 'food'] },
  { emoji: '🍣', name: 'Sushi', category: 'food', keywords: ['japanese', 'fish', 'food'] },
  { emoji: '🍰', name: 'Shortcake', category: 'food', keywords: ['cake', 'dessert', 'birthday'] },
  { emoji: '☕', name: 'Hot beverage', category: 'food', keywords: ['coffee', 'tea', 'cafe', 'drink'] },
  { emoji: '🍦', name: 'Soft ice cream', category: 'food', keywords: ['dessert', 'summer', 'sweet'] },
  { emoji: '🚗', name: 'Automobile', category: 'travel', keywords: ['car', 'vehicle', 'drive'] },
  { emoji: '🚕', name: 'Taxi', category: 'travel', keywords: ['cab', 'car', 'vehicle'] },
  { emoji: '🚌', name: 'Bus', category: 'travel', keywords: ['vehicle', 'transit'] },
  { emoji: '🚲', name: 'Bicycle', category: 'travel', keywords: ['bike', 'cycle', 'vehicle'] },
  { emoji: '✈️', name: 'Airplane', category: 'travel', keywords: ['flight', 'travel', 'plane'] },
  { emoji: '🚀', name: 'Rocket', category: 'travel', keywords: ['space', 'launch', 'ship'] },
  { emoji: '🚆', name: 'Train', category: 'travel', keywords: ['rail', 'transport', 'vehicle'] },
  { emoji: '⛵', name: 'Sailboat', category: 'travel', keywords: ['boat', 'ocean', 'ship'] },
  { emoji: '🏖️', name: 'Beach with umbrella', category: 'travel', keywords: ['vacation', 'summer', 'travel'] },
  { emoji: '🏔️', name: 'Snow-capped mountain', category: 'travel', keywords: ['mountain', 'nature', 'travel'] },
  { emoji: '⚽', name: 'Soccer ball', category: 'activities', keywords: ['football', 'sports', 'game'] },
  { emoji: '🏀', name: 'Basketball', category: 'activities', keywords: ['sports', 'game'] },
  { emoji: '🎾', name: 'Tennis', category: 'activities', keywords: ['sports', 'racket', 'game'] },
  { emoji: '🎮', name: 'Video game', category: 'activities', keywords: ['gaming', 'controller', 'play'] },
  { emoji: '🎲', name: 'Game die', category: 'activities', keywords: ['dice', 'board game', 'random'] },
  { emoji: '🎸', name: 'Guitar', category: 'activities', keywords: ['music', 'instrument', 'rock'] },
  { emoji: '🎤', name: 'Microphone', category: 'activities', keywords: ['sing', 'music', 'karaoke'] },
  { emoji: '🎨', name: 'Artist palette', category: 'activities', keywords: ['art', 'paint', 'creative'] },
  { emoji: '🏆', name: 'Trophy', category: 'activities', keywords: ['award', 'winner', 'prize'] },
  { emoji: '📱', name: 'Mobile phone', category: 'objects', keywords: ['device', 'technology', 'cell'] },
  { emoji: '💻', name: 'Laptop', category: 'objects', keywords: ['computer', 'technology', 'work'] },
  { emoji: '⌚', name: 'Watch', category: 'objects', keywords: ['time', 'clock', 'wearable'] },
  { emoji: '📷', name: 'Camera', category: 'objects', keywords: ['photo', 'photography', 'picture'] },
  { emoji: '💡', name: 'Light bulb', category: 'objects', keywords: ['idea', 'bright', 'electric'] },
  { emoji: '📚', name: 'Books', category: 'objects', keywords: ['read', 'study', 'library'] },
  { emoji: '✏️', name: 'Pencil', category: 'objects', keywords: ['write', 'draw', 'school'] },
  { emoji: '🔑', name: 'Key', category: 'objects', keywords: ['lock', 'password', 'access'] },
  { emoji: '🎁', name: 'Wrapped gift', category: 'objects', keywords: ['present', 'birthday', 'holiday'] },
  { emoji: '🧭', name: 'Compass', category: 'objects', keywords: ['direction', 'navigation', 'travel'] },
  { emoji: '❤️', name: 'Red heart', category: 'symbols', keywords: ['love', 'like', 'romance'] },
  { emoji: '💛', name: 'Yellow heart', category: 'symbols', keywords: ['love', 'friendship'] },
  { emoji: '💚', name: 'Green heart', category: 'symbols', keywords: ['love', 'nature'] },
  { emoji: '💙', name: 'Blue heart', category: 'symbols', keywords: ['love', 'trust'] },
  { emoji: '✨', name: 'Sparkles', category: 'symbols', keywords: ['magic', 'shine', 'stars'] },
  { emoji: '⭐', name: 'Star', category: 'symbols', keywords: ['favorite', 'rating', 'night'] },
  { emoji: '🔥', name: 'Fire', category: 'symbols', keywords: ['hot', 'lit', 'flame'] },
  { emoji: '✅', name: 'Check mark button', category: 'symbols', keywords: ['done', 'yes', 'complete'] },
  { emoji: '❌', name: 'Cross mark', category: 'symbols', keywords: ['no', 'wrong', 'cancel'] },
  { emoji: '💯', name: 'Hundred points', category: 'symbols', keywords: ['perfect', 'score', 'one hundred'] },
  { emoji: '🇺🇸', name: 'Flag: United States', category: 'flags', keywords: ['america', 'usa', 'country'] },
  { emoji: '🇬🇧', name: 'Flag: United Kingdom', category: 'flags', keywords: ['britain', 'uk', 'country'] },
  { emoji: '🇨🇦', name: 'Flag: Canada', category: 'flags', keywords: ['canadian', 'country'] },
  { emoji: '🇯🇵', name: 'Flag: Japan', category: 'flags', keywords: ['japanese', 'country'] },
  { emoji: '🇫🇷', name: 'Flag: France', category: 'flags', keywords: ['french', 'country'] },
]

const VALID_CATEGORIES = new Set<string>(EMOJI_CATEGORIES.map(({ id }) => id))

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function validateQuery(query: unknown): string {
  if (typeof query !== 'string') throw new Error('Search query must be text.')
  if (query.length > MAX_QUERY_LENGTH) throw new Error(`Search query must be ${MAX_QUERY_LENGTH} characters or fewer.`)
  return query.trim().toLowerCase()
}

function validateCategory(category: unknown): EmojiFilterCategory {
  if (typeof category !== 'string' || !VALID_CATEGORIES.has(category)) {
    throw new Error('Category must be one of the available emoji categories.')
  }
  return category as EmojiFilterCategory
}

export function filterEmojis(query: unknown = '', category: unknown = 'all', limit = MAX_RESULTS): EmojiEntry[] {
  const normalizedQuery = validateQuery(query)
  const selectedCategory = validateCategory(category)
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_RESULTS) {
    throw new Error(`Result limit must be an integer from 1 to ${MAX_RESULTS}.`)
  }

  const matches: EmojiEntry[] = []
  for (const entry of EMOJI_CATALOG) {
    if (selectedCategory !== 'all' && entry.category !== selectedCategory) continue
    if (normalizedQuery) {
      const searchableText = `${entry.name} ${entry.keywords.join(' ')} ${entry.emoji}`.toLowerCase()
      if (!searchableText.includes(normalizedQuery)) continue
    }
    matches.push(entry)
    if (matches.length >= limit) break
  }
  return matches
}

export function run(input: string, options: ToolOptions = {}): string {
  if (!isPlainObject(options)) throw new Error('Options must be a plain object.')
  const keys = Object.keys(options)
  if (keys.some(key => key !== 'category' && key !== 'limit')) {
    throw new Error(`Unsupported option: ${keys.find(key => key !== 'category' && key !== 'limit')}.`)
  }

  const category = options.category ?? 'all'
  const rawLimit = options.limit ?? String(MAX_RESULTS)
  if (typeof rawLimit !== 'string' || !/^[1-9]\d{0,2}$/.test(rawLimit)) {
    throw new Error(`Option "limit" must be a whole number from 1 to ${MAX_RESULTS}.`)
  }
  const limit = Number(rawLimit)
  if (limit > MAX_RESULTS) throw new Error(`Option "limit" must be a whole number from 1 to ${MAX_RESULTS}.`)
  return JSON.stringify(filterEmojis(input, category, limit), null, 2)
}
