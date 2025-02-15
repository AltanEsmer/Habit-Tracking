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