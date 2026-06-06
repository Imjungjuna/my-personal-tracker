'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { GoalWithPeriods } from '@/lib/checklist/types'

interface Props {
  goal: GoalWithPeriods
  done: boolean
  inactive?: boolean
  onToggleDone: () => void
  onToggleActive: () => void
}

export function GoalCheckRow({ goal, done, inactive = false, onToggleDone, onToggleActive }: Props) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors ${
        done ? 'bg-emerald-50' : inactive ? '' : 'hover:bg-muted/30'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleDone}
        disabled={inactive}
        aria-label={done ? '완료 취소' : '완료로 표시'}
        className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-paw-brown-light bg-transparent hover:border-paw-brown'
          }
          ${inactive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <AnimatePresence>
          {done && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {/* Goal name */}
      <span
        className={`flex-1 text-base font-medium transition-colors ${
          done
            ? 'text-muted-foreground line-through'
            : inactive
            ? 'text-muted-foreground'
            : 'text-bark-dark'
        }`}
      >
        {goal.name}
      </span>

      {/* Active toggle */}
      <button
        onClick={onToggleActive}
        className="text-xs text-muted-foreground hover:text-bark-dark px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
        aria-label={inactive ? `${goal.name} 다시 활성화` : `${goal.name} 잠시 중단`}
      >
        {inactive ? '다시 시작' : '중단'}
      </button>
    </div>
  )
}
