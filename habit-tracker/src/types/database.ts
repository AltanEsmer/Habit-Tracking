export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_completion: number;
  color: string;
}

export type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
  habits?: {
    title: string;
    color: string;
  };
} 

export type StreakStats = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export type MilestoneType = {
  id: number;
  days: number;
  name: string;
  icon: string;
  achieved: boolean;
}

export type User = {
  id: number;
  name: string;
  user_id: string;
  xp: number;
  level: number;
};

export type Achievement = {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  required_value: number;
  type: 'streak' | 'completion' | 'time_based' | 'milestone';
}

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  achieved: boolean;
  achieved_at: string | null;
  achievement?: Achievement;
}