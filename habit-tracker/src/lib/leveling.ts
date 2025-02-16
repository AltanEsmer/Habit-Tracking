import { supabase } from './supabaseClient';

export async function checkLevelUp(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const xpForNextLevel = user.level * 100; // Example: 100 XP per level
  if (user.xp >= xpForNextLevel) {
    const { error: levelUpError } = await supabase
      .from('users')
      .update({ level: user.level + 1, xp: user.xp - xpForNextLevel })
      .eq('id', userId);

    if (levelUpError) throw levelUpError;
  }
} 