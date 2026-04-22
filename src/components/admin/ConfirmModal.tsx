'use client'

/**
 * ConfirmModal — brand-styled replacement for window.confirm().
 *
 * Usage (in any admin page under <ConfirmModalProvider>):
 *   const confirm = useConfirm()
 *   const ok = await confirm({ title: 'Obriši proizvod?', body: '...', danger: true })
 *   if (!ok) return
 *
 * The provider mounts once at admin layout level; consumers call `useConfirm()`
 * to get an imperative Promise-based API.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmOptions {
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used inside <ConfirmModalProvider>')
  }
  return ctx
}

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOpts(null)
  }, [])

  // Esc to cancel
  useEffect(() => {
    if (!opts) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
      if (e.key === 'Enter') close(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opts, close])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={opts.title}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => close(false)}
            aria-hidden="true"
          />
          <div
            className={`relative w-full max-w-md rounded-2xl border bg-[#111113] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${
              opts.danger
                ? 'border-fire-500/40 shadow-[0_0_0_1px_rgba(229,36,33,0.15)]'
                : 'border-white/10'
            }`}
          >
            <div className="flex items-start gap-4">
              {opts.danger && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-fire-500/10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-fire-500" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-black uppercase tracking-[0.05em] text-white">
                  {opts.title}
                </h2>
                {opts.body && (
                  <p className="mt-2 text-sm leading-6 text-white/70">{opts.body}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {opts.cancelLabel ?? 'Otkaži'}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                autoFocus
                className={`rounded-lg border-2 px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5 ${
                  opts.danger
                    ? 'border-fire-500 bg-fire-500 hover:bg-fire-600'
                    : 'border-ember-500 bg-ember-500 hover:bg-ember-600'
                }`}
              >
                {opts.confirmLabel ?? 'Potvrdi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
