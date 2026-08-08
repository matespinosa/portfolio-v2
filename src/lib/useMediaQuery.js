import { useSyncExternalStore } from 'react'

/** Reactive matchMedia — re-renders when the query flips. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches
  )
}
