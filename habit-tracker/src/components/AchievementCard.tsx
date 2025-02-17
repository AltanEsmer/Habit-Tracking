"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    achieved: boolean;
    progress: number;
    required_value: number;
  };
  wasJustUnlocked?: boolean;
}

export function AchievementCard({ achievement, wasJustUnlocked = false }: AchievementCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-300 ${
        achievement.achieved ? 'bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200' : ''
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <motion.span 
              className="text-3xl"
              animate={wasJustUnlocked ? {
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {achievement.icon}
            </motion.span>
            <Badge 
              variant={achievement.achieved ? "outline" : "default"}
            >
              {achievement.achieved ? "Achieved" : "In Progress"}
            </Badge>
          </div>
          <CardTitle className="mt-2">{achievement.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{achievement.description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-emerald-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((achievement.progress / achievement.required_value) * 100, 100)}%` 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {achievement.progress} / {achievement.required_value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
} 