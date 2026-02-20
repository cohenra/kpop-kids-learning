import { useState, useCallback } from 'react'
import { getParentPin, setParentPin, getRoomLocks, setRoomLock } from '../utils/storage'

// ─── useParentMode: PIN + room lock/unlock ─────────────────────────────────────

interface UseParentModeReturn {
  isUnlocked: boolean
  hasPin: boolean
  unlock: (pin: string) => boolean
  lock: () => void
  setupPin: (pin: string) => void
  changePin: (oldPin: string, newPin: string) => boolean
  roomLocks: Record<string, boolean>
  toggleRoomLock: (roomId: string) => void
  isRoomLocked: (roomId: string) => boolean
}

export function useParentMode(): UseParentModeReturn {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [roomLocks, setRoomLocksState] = useState<Record<string, boolean>>(
    getRoomLocks
  )

  const hasPin = getParentPin() !== null

  const unlock = useCallback((pin: string): boolean => {
    const stored = getParentPin()
    if (stored === pin) {
      setIsUnlocked(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    setIsUnlocked(false)
  }, [])

  const setupPin = useCallback((pin: string) => {
    setParentPin(pin)
  }, [])

  const changePin = useCallback((oldPin: string, newPin: string): boolean => {
    const stored = getParentPin()
    if (stored === oldPin) {
      setParentPin(newPin)
      return true
    }
    return false
  }, [])

  const toggleRoomLock = useCallback((roomId: string) => {
    const current = getRoomLocks()
    const newLocked = !current[roomId]
    setRoomLock(roomId, newLocked)
    setRoomLocksState(getRoomLocks())
  }, [])

  const isRoomLocked = useCallback(
    (roomId: string): boolean => {
      return roomLocks[roomId] === true
    },
    [roomLocks]
  )

  return {
    isUnlocked,
    hasPin,
    unlock,
    lock,
    setupPin,
    changePin,
    roomLocks,
    toggleRoomLock,
    isRoomLocked,
  }
}
