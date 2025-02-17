import { supabase } from './supabaseClient';
import { Habit, HabitCompletion } from '@/types/database';
import { awardXP, XP_REWARDS } from './xp';
import { checkAndUpdateAchievements } from './achievements';
import { format } from 'date-fns';

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
  try {
    // If not completed, we want to complete it
    if (!completed) {
      const { data, error: insertError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: format(date, 'yyyy-MM-dd')
        })
        .select();

      if (insertError) {
        console.error('Insert Error:', insertError);
        throw new Error(insertError.message);
      }

      // Add XP when completing
      const { error: xpError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          xp: supabase.rpc('increment', { value: 10 }),
          level: 1
        });

      if (xpError) {
        console.error('XP Error:', xpError);
        throw new Error(xpError.message);
      }
    } else {
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .match({
          habit_id: habitId,
          user_id: userId,
          completed_at: format(date, 'yyyy-MM-dd')
        });

      if (deleteError) {
        console.error('Delete Error:', deleteError);
        throw new Error(deleteError.message);
      }

      // Remove XP when uncompleting
      const { error: xpError } = await supabase
        .from('users')
        .update({ 
          xp: supabase.rpc('increment', { column: 'xp', value: -10 })
        })
        .eq('user_id', userId);

      if (xpError) {
        console.error('XP Error:', xpError);
        throw new Error(xpError.message);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in toggleHabitCompletion:', error);
    throw error;
  }
} 