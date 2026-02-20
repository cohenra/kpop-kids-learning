import { useMemo } from 'react'

// ─── CSS-only star particle background (no canvas) ────────────────────────────

interface Star {
  id: number
  top: string
  left: string
  size: number
  delay: string
  duration: string
  opacity: number
}

const STAR_COUNT = 40

export function StarParticles() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 4}s`,
      duration: `${1.5 + Math.random() * 3}s`,
      opacity: 0.2 + Math.random() * 0.5,
    }))
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: star.id % 3 === 0
              ? '#EC4899'
              : star.id % 3 === 1
              ? '#06B6D4'
              : '#F9FAFB',
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
