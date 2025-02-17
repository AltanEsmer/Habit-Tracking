"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { calculateStreakStats } from "@/lib/streaks";
import { MilestoneType, StreakStats } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Trophy, TrendingUp, Home, Settings, Plus, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCurrentXP } from "@/lib/xp";
import { ProgressGraph } from "@/components/ProgressGraph";
import { supabase } from "@/lib/supabaseClient";
import { subDays, format } from "date-fns";

export default function ProgressPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [xpData, setXpData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneType[]>([
    {
      id: 1,
      days: 7,
      name: "Week Warrior",
      icon: "🌟",
      achieved: false,
    },
    {
      id: 2,
      days: 30,
      name: "Monthly Master",
      icon: "🏆",
      achieved: false,
    },
    {
      id: 3,
      days: 100,
      name: "Century Champion",
      icon: "👑",
      achieved: false,
    },
  ]);

  const dummyData = [
    { date: '2024-01-01', completions: 3, xp: 30 },
    { date: '2024-01-02', completions: 4, xp: 45 },
    { date: '2024-01-03', completions: 2, xp: 25 },
    { date: '2024-01-04', completions: 5, xp: 60 },
    { date: '2024-01-05', completions: 3, xp: 35 },
  ];

  useEffect(() => {
    if (user?.id) {
      loadStats();
      
      // Subscribe to habit_completions changes
      const channel = supabase
        .channel('habit_completions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'habit_completions' },
          () => {
            loadStats();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  async function loadStats() {
    try {
      const [streakStats, xpStats] = await Promise.all([
        calculateStreakStats(user!.id),
        getCurrentXP(user!.id)
      ]);
      setStats(streakStats);
      setXpData(xpStats);
      
      // Update milestone achievements
      const updatedMilestones = milestones.map(milestone => ({
        ...milestone,
        achieved: streakStats.currentStreak >= milestone.days
      }));
      setMilestones(updatedMilestones);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGraphData() {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const { data } = await supabase
      .from('habit_completions')
      .select('completed_at, xp')
      .eq('user_id', user!.id)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at');

    // Process data for graph
    const processedData = data?.reduce((acc, curr) => {
      const date = format(new Date(curr.completed_at), 'yyyy-MM-dd');
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.completions++;
        existing.xp += curr.xp;
      } else {
        acc.push({ date, completions: 1, xp: curr.xp });
      }
      return acc;
    }, [] as any[]);

    setGraphData(processedData || []);
  }

  if (loading) {
    return <ProgressSkeleton />;
  }

  const nextMilestone = milestones.find(m => !m.achieved);
  const progressToNextMilestone = nextMilestone
    ? (stats?.currentStreak || 0) / nextMilestone.days * 100
    : 100;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with full height */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
        </div>
        
        <nav className="p-4 flex flex-col h-[calc(100%-140px)]"> {/* Adjust height to account for header and footer */}
          <div className="space-y-2">
            <SidebarItem icon={<Home />} text="Dashboard" href="/MainPage" />
            <SidebarItem icon={<CalendarIcon />} text="Calendar" href="/CalendarPage" />
            <SidebarItem icon={<TrendingUp />} text="Progress" active href="/progress" />
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

      {/* Main Content with margin for sidebar */}
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Progress Overview</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Level Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Level {xpData?.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{xpData?.xp} XP</p>
              <p className="text-sm text-white/80">Keep going!</p>
            </CardContent>
          </Card>

          {/* Current Streak Card */}
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.currentStreak || 0} days</p>
              <p className="text-sm text-white/80">Keep the momentum!</p>
            </CardContent>
          </Card>

          {/* Longest Streak Card */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.longestStreak || 0} days</p>
              <p className="text-sm text-white/80">Personal best!</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Graph */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]"> {/* Increased from 200px to 400px for better visibility */}
            <ProgressGraph data={graphData.length > 0 ? graphData : dummyData} />
          </CardContent>
        </Card>

        {/* Milestone Badges */}
        <Card className="mb-8"> {/* Added margin-bottom */}
          <CardHeader className="pb-3"> {/* Reduced padding */}
            <CardTitle className="text-xl font-semibold">Milestone Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {milestones.map((milestone) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border ${  // Reduced padding from p-6 to p-4
                      milestone.achieved
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{milestone.icon}</span>
                      <div>
                        <h3 className="font-semibold">{milestone.name}</h3>
                        <p className="text-sm text-gray-600">
                          {milestone.days} days streak
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={milestone.achieved ? "outline" : "secondary"}
                      className="mt-3"
                    >
                      {milestone.achieved ? "Achieved" : "In Progress"}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-24 mb-4" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-24" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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