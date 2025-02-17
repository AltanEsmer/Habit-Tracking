"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Trophy, TrendingUp, Home, Settings, Plus, LogOut } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { Habit, HabitCompletion } from "@/types/database"
import { getHabits, getHabitCompletions, toggleHabitCompletion } from "@/lib/habits"
import { getCurrentXP } from "@/lib/xp"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { Loader2 } from "lucide-react"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const router = useRouter()
  const [userStats, setUserStats] = useState<{ xp: number; level: number } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      loadHabits();
      loadCompletions();
      loadUserStats();
    }
  }, [user, date]);

  async function loadHabits() {
    try {
      const data = await getHabits(user!.id);
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }

  async function loadCompletions() {
    try {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const data = await getHabitCompletions(user!.id, start, end);
      setCompletions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading completions:', error);
      setLoading(false);
    }
  }

  async function loadUserStats() {
    try {
      const data = await getCurrentXP(user!.id);
      setUserStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async function handleToggleHabit(habitId: string, date: Date, completed: boolean) {
    try {
      await toggleHabitCompletion(habitId, user!.id, date, !completed);
      await loadCompletions();
      await loadUserStats();
      
      toast({
        title: !completed ? "Habit Completed!" : "Habit Uncompleted",
        description: !completed ? "+10 XP" : "-10 XP",
        variant: !completed ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update habit. Please try again.",
        variant: "destructive"
      });
    }
  }

  function getDayCompletions(date: Date) {
    return completions.filter(completion => 
      format(new Date(completion.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
            <SidebarItem icon={<Home />} text="Dashboard" href="/MainPage" />
            <SidebarItem icon={<CalendarIcon />} text="Calendar" active href="/CalendarPage" />
            <SidebarItem icon={<TrendingUp />} text="Progress" href="/progress" />
            <SidebarItem icon={<Trophy />} text="Achievements" href="/achievements" />
            <SidebarItem icon={<Settings />} text="Settings" href="/settings" />
          </div>

          <div className="mt-4 pt-4 border-t">
            <AddHabitDialog onHabitAdded={loadHabits} />
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
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Habit Calendar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => {
                  const dayCompletions = getDayCompletions(date);
                  return (
                    <div className="relative w-full h-full p-2">
                      <span className="absolute top-1 left-1">
                        {date.getDate()}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-4">
                        {dayCompletions.map((completion) => (
                          <div
                            key={completion.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: completion.habits?.color || '#10b981' }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {format(date, 'MMMM d, yyyy')}
            </h2>
            <div className="space-y-4">
              {habits.map((habit) => {
                const completed = completions.some(
                  completion => 
                    completion.habit_id === habit.id && 
                    format(new Date(completion.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                );
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => handleToggleHabit(habit.id, date, completed)}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 checked:bg-emerald-600 checked:border-emerald-600"
                      />
                      <span className="ml-3 text-gray-700">{habit.title}</span>
                    </div>
                    <Badge 
                      style={{ backgroundColor: habit.color }}
                      className="text-white"
                    >
                      {habit.frequency}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {userStats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Level</p>
                  <h3 className="text-3xl font-bold">{userStats.level}</h3>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60">Experience</p>
                  <h3 className="text-3xl font-bold">{userStats.xp} XP</h3>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  text, 
  active = false,
  href 
}: { 
  icon: React.ReactNode; 
  text: string; 
  active?: boolean;
  href: string;
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