"use client"

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'

interface AchievementUnlockProps {
  title: string
  icon: string
  isOpen: boolean
  onClose: () => void
}

export function AchievementUnlock({ title, icon, isOpen, onClose }: AchievementUnlockProps) {
  const [play] = useSound('/sounds/achievement.mp3') // Add a sound file to public/sounds/
  
  useEffect(() => {
    if (isOpen) {
      play()
      setTimeout(onClose, 5000) // Auto close after 5 seconds
    }
  }, [isOpen, play, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-white rounded-lg shadow-xl p-6 z-50"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-2"
            >
              {icon}
            </motion.div>
            <h3 className="text-xl font-bold mb-1">Achievement Unlocked!</h3>
            <p className="text-gray-600">{title}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 