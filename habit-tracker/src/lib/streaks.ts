import { HabitCompletion } from "@/types/database";
import { supabase } from "./supabaseClient";
import { isYesterday, isSameDay, subDays } from "date-fns";

export async function calculateStreakStats(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}> {
  try {
    const { data: completions, error } = await supabase
      .from('habit_completions')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    if (!completions.length) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      };
    }

    const dates = completions.map(c => new Date(c.completed_at));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const lastDate = dates[0];

    // Calculate current streak
    const today = new Date();
    let checkDate = today;
    let dateIndex = 0;

    while (dateIndex < dates.length) {
      if (isSameDay(dates[dateIndex], checkDate) || 
          isSameDay(dates[dateIndex], subDays(checkDate, 1))) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
        dateIndex++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    dates.forEach((date, index) => {
      if (index === 0) {
        tempStreak = 1;
      } else {
        const prevDate = dates[index - 1];
        if (isYesterday(prevDate)) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    });

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: lastDate.toISOString(),
    };
  } catch (error) {
    console.error('Error calculating streak stats:', error);
    throw error;
  }
}

export function checkMilestoneAchievements(currentStreak: number, milestones: { days: number }[]) {
  return milestones.map(milestone => ({
    ...milestone,
    achieved: currentStreak >= milestone.days
  }));
}

export async function awardXP(userId: string, xp: number) {
  const { data, error } = await supabase
    .from('users')
    .update({ xp: `xp + ${xp}` })
    .eq('id', userId);

  if (error) throw error;
  return data;
}