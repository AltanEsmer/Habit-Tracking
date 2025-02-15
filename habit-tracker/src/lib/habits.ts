import { supabase } from './supabaseClient';
import { Habit, HabitCompletion } from '@/types/database';

export async function createHabit(habit: Omit<Habit, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error.message);
    throw error;
  }
  return data;
}

export async function getHabits(userId: string) {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Habit[];
}

export async function getHabitCompletions(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('habit_completions')
    .select(`
      *,
      habits (
        title,
        color
      )
    `)
    .eq('user_id', userId)
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  if (error) throw error;
  return data;
}

export async function toggleHabitCompletion(
  habitId: string, 
  userId: string, 
  date: Date,
  completed: boolean
) {
  if (completed) {
    // Add completion
    const { error } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        user_id: userId,
        completed_at: date.toISOString(),
      });
    if (error) throw error;
  } else {
    // Remove completion
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completed_at', date.toISOString());
    if (error) throw error;
  }
} 