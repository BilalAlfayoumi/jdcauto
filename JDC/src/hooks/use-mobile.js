import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook pour détecter si l'utilisateur est sur un appareil mobile
 * @returns {boolean} - true si l'écran est plus petit que le breakpoint mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

