'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addGoal } from '@/lib/checklist/actions'

export function AddGoalForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const openForm = () => {
    setOpen(true)
    // focus after state update renders the input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const closeForm = () => {
    setOpen(false)
    setName('')
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await addGoal(name.trim())
        closeForm()
        router.refresh()
      } catch {
        setError('목표 추가에 실패했어요. 다시 시도해주세요.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={openForm}
        className="w-full flex items-center gap-2 px-5 py-4 rounded-3xl bg-warm-white/80 border-2 border-dashed border-paw-brown-light text-muted-foreground hover:text-bark-dark hover:border-paw-brown transition-colors text-sm font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        목표 추가
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-4"
    >
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="새 목표 이름 (예: 물 2L 마시기)"
        maxLength={200}
        className="w-full bg-transparent text-bark-dark placeholder:text-muted-foreground text-base font-medium outline-none border-b border-border pb-2 mb-3"
      />
      {error && <p className="text-xs text-rose-500 mb-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={closeForm}
          className="px-4 py-1.5 text-sm text-muted-foreground hover:text-bark-dark transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isPending}
          className="px-4 py-1.5 text-sm font-semibold bg-sleepy-yellow text-bark-dark rounded-lg disabled:opacity-40 transition-opacity"
        >
          {isPending ? '추가 중...' : '추가'}
        </button>
      </div>
    </form>
  )
}
