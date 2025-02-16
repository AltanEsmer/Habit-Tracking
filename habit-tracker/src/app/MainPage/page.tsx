"use client";

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Trophy, TrendingUp, Home, Settings, Plus, LogOut } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function MainPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            <SidebarItem icon={<Home />} text="Dashboard" active href="/MainPage" />
            <SidebarItem icon={<Calendar />} text="Calendar" href="/CalendarPage" />
            <SidebarItem icon={<TrendingUp />} text="Progress" href="/ProgressPage" />
            <SidebarItem icon={<Trophy />} text="Achievements" href="/achievements" />
            <SidebarItem icon={<Settings />} text="Settings" href="/settings" />
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button 
              className="w-full justify-start text-gray-700 hover:text-emerald-600"
              variant="ghost"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Habit
            </Button>
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
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome back!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              title="Current Streak"
              value="7 days"
              icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            />
            <StatsCard 
              title="Habits Completed"
              value="12/15"
              icon={<Calendar className="w-6 h-6 text-cyan-600" />}
            />
            <StatsCard 
              title="Achievements"
              value="5 earned"
              icon={<Trophy className="w-6 h-6 text-amber-600" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Today's Habits</h2>
              <div className="space-y-4">
                <HabitItem title="Morning Meditation" completed={true} />
                <HabitItem title="Read 30 minutes" completed={true} />
                <HabitItem title="Exercise" completed={false} />
                <HabitItem title="Drink 8 glasses of water" completed={false} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Weekly Progress</h2>
              <div className="space-y-4">
                <ProgressItem title="Meditation" progress={80} />
                <ProgressItem title="Reading" progress={60} />
                <ProgressItem title="Exercise" progress={40} />
                <ProgressItem title="Water Intake" progress={70} />
              </div>
            </Card>
          </div>
        </div>
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
  href?: string
}) {
  const router = useRouter()
  
  return (
    <Button 
      variant="ghost" 
      className={`w-full justify-start ${active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}
      onClick={() => href && router.push(href)}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </Button>
  )
}

function StatsCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </Card>
  )
}

function HabitItem({ title, completed }: { title: string; completed: boolean }) {
  return (
    <div className="flex items-center">
      <input 
        type="checkbox" 
        checked={completed} 
        className="w-5 h-5 text-emerald-600 rounded-full"
        readOnly
      />
      <span className={`ml-3 ${completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {title}
      </span>
    </div>
  )
}

function ProgressItem({ title, progress }: { title: string; progress: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700">{title}</span>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}