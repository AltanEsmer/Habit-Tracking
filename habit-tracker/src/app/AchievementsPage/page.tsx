"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar as CalendarIcon, Trophy, TrendingUp, Home, Settings, Plus, LogOut } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getUserAchievements } from "@/lib/achievements"
import { Achievement } from "@/types/database"
import { AchievementCard } from "@/components/AchievementCard"
import { AchievementUnlock } from "@/components/AchievementUnlock"

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  achieved: boolean;
  achieved_at: string | null;
  achievement?: Achievement;
}

export default function AchievementsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedAchievement, setUnlockedAchievement] = useState<UserAchievement | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadAchievements()
    }
  }, [user])

  async function loadAchievements() {
    try {
      console.log('Loading achievements for user:', user!.id)
      const data = await getUserAchievements(user!.id)
      console.log('Loaded achievements:', data)
      setAchievements(data)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Using the same sidebar from your other pages */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            <SidebarItem icon={<Home />} text="Dashboard" href="/MainPage" />
            <SidebarItem icon={<CalendarIcon />} text="Calendar" href="/CalendarPage" />
            <SidebarItem icon={<TrendingUp />} text="Progress" href="/progress" />
            <SidebarItem icon={<Trophy />} text="Achievements" active href="/achievements" />
            <SidebarItem icon={<Settings />} text="Settings" href="/settings" />
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between p-2">
            <UserButton afterSignOutUrl="/" />
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5 text-gray-700 hover:text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Achievements</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((userAchievement) => (
              <AchievementCard 
                key={userAchievement.id} 
                achievement={{
                  id: userAchievement.id,
                  title: userAchievement.achievement.title,
                  description: userAchievement.achievement.description,
                  icon: userAchievement.achievement.icon,
                  achieved: userAchievement.achieved,
                  progress: userAchievement.progress,
                  required_value: userAchievement.achievement.required_value
                }}
              />
            ))}
          </div>
        )}

        <AchievementUnlock
          isOpen={!!unlockedAchievement}
          title={unlockedAchievement?.achievement?.title || ''}
          icon={unlockedAchievement?.achievement?.icon || ''}
          onClose={() => setUnlockedAchievement(null)}
        />
      </div>
    </div>
  )
}

function SidebarItem({ 
  icon, 
  text, 
  active = false,
  href 
}: { 
  icon: React.ReactNode
  text: string
  active?: boolean
  href: string
}) {
  const router = useRouter()
  
  return (
    <Button 
      variant="ghost" 
      className={`w-full justify-start ${active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}
      onClick={() => router.push(href)}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </Button>
  )
}