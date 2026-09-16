import { ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    // Run once on mount to set initial state
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] hover:opacity-90 hover:-translate-y-1 transition-all duration-300"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}
