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

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Progress</h1>
        
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Your Progress</h1>
          
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Level {xpData?.level}</h2>
              <p className="text-3xl font-bold">{xpData?.xp} XP</p>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Streak</h2>
              <p className="text-3xl font-bold">{stats?.currentStreak || 0} days</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
            <ProgressGraph data={dummyData} />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Longest Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-4xl font-bold">{stats?.longestStreak || 0}</span>
                  <span className="text-muted-foreground">days</span>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Milestone Badges</CardTitle>
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
                        className={`p-4 rounded-lg border ${
                          milestone.achieved
                            ? "bg-primary/10 border-primary"
                            : "bg-muted border-muted-foreground/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{milestone.icon}</span>
                          <div>
                            <h3 className="font-semibold">{milestone.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {milestone.days} days streak
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={milestone.achieved ? "default" : "secondary"}
                          className="mt-2"
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