import { supabase } from './supabaseClient';
import { checkLevelUp } from './leveling';

export const XP_REWARDS = {
  HABIT_COMPLETION: 10,
  STREAK_BONUS: 5,
  PERFECT_WEEK: 50
};

export async function awardXP(userId: string, xp: number) {
  const { data, error } = await supabase
    .from('users')
    .update({ xp: `xp + ${xp}` })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Check for level up
  await checkLevelUp(userId);
  return data;
}

export async function getCurrentXP(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('xp, level')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
} 