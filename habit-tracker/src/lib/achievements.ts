import { supabase } from './supabaseClient';
import { Achievement, UserAchievement } from '@/types/database';

export async function initializeUserAchievements(userId: string) {
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id');

  if (achievements) {
    for (const achievement of achievements) {
      await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: 0,
          achieved: false
        }, {
          onConflict: 'user_id,achievement_id'
        });
    }
  }
}

export async function getUserAchievements(userId: string) {
  // First, get all available achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  // Initialize user achievements if they don't exist
  if (allAchievements) {
    const { data: existingUserAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const existingIds = existingUserAchievements?.map(ua => ua.achievement_id) || [];
    
    // Create missing user achievements
    for (const achievement of allAchievements) {
      if (!existingIds.includes(achievement.id)) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            progress: 0,
            achieved: false
          });
      }
    }
  }

  // Now get all user achievements with their details
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  console.log('Loaded achievements:', data); // Debug log
  return data;
}

export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
) {
  const { data: achievement } = await supabase
    .from('achievements')
    .select('required_value')
    .eq('id', achievementId)
    .single();

  const achieved = progress >= (achievement?.required_value || 0);

  const { error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      progress,
      achieved,
      achieved_at: achieved ? new Date().toISOString() : null
    }, {
      onConflict: 'user_id,achievement_id'
    });

  if (error) throw error;
}

export async function checkAndUpdateAchievements(userId: string) {
  // Check streak-based achievements
  const { data: streakStats } = await supabase.rpc('get_user_streak', { user_id: userId });
  
  // Update streak achievements
  const { data: streakAchievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('type', 'streak');

  if (streakAchievements) {
    for (const achievement of streakAchievements) {
      await updateAchievementProgress(
        userId,
        achievement.id,
        streakStats?.current_streak || 0
      );
    }
  }

  // Check completion achievements
  const { count } = await supabase
    .from('habit_completions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  const { data: completionAchievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('type', 'completion');

  if (completionAchievements) {
    for (const achievement of completionAchievements) {
      await updateAchievementProgress(
        userId,
        achievement.id,
        count || 0
      );
    }
  }
} 