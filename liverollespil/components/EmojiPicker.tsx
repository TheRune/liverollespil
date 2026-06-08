'use client'

interface EmojiPickerProps {
  isOpen: boolean
  onSelect: (emoji: string) => void
  onClose: () => void
}

const emojis = [
  '⚔️', '🛡️', '✨', '🔥', '❄️', '🌪️', '💫', '⚡',
  '🧠', '❤️', '🪓', '🧿', '🎯', '🌀', '🌟', '🧱',
  '🧲', '🔮', '☠️', '🕯️', '🌙', '🪄', '🪐', '🗡️',
  '🧝', '🧙', '🧛', '👑', '🛡️', '🏹', '🏰', '🐉',
  '🗺️', '📜', '⚗️', '🩸', '🪓', '🥾', '🍄', '🦄',
  '🧚', '⛓️', '🪨', '🌿', '🥀', '🪦', '🌊', '🌋',
  '🌟', '💥', '🪤', '⚜️', '🎭', '📯', '🛡️', '🧱',
  '🧪', '🧬', '🧨', '🔱', '🏺', '🧹', '🪓', '🪞',
]

export default function EmojiPicker({ isOpen, onSelect, onClose }: EmojiPickerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Vælg et emoji ikon</h2>
            <p className="text-sm text-gray-600">Klik for at vælge en emoji til evnen.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Luk emoji-vælger"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-2xl transition hover:border-blue-400 hover:bg-blue-50"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
