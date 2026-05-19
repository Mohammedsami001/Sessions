// ============================================
// Sessions Study OS — Database Type Definitions
// ============================================

// ---------- Database Row Types ----------

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_focus_seconds: number;
  exp: number;
  total_sessions: number;
  streak_days: number;
  last_active_date: string | null;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  title: string;
  category: string;
  host_id: string;
  visibility: 'public' | 'private';
  join_code: string | null;
  focus_duration: number;      // seconds
  break_duration: number;      // seconds
  long_break_duration: number; // seconds
  long_break_interval: number;
  timer_status: 'idle' | 'focus' | 'break' | 'long_break';
  timer_started_at: string | null;
  cycles_completed: number;
  created_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  room_id: string | null;
  text: string;
  completed: boolean;
  created_at: string;
}

// ---------- Joined / Enriched Types ----------

export interface MessageWithProfile extends Message {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'>;
}

export interface RoomWithParticipantCount extends Room {
  participant_count: number;
}

export interface RoomParticipantWithProfile extends RoomParticipant {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'>;
}

// ---------- Room Creation Input ----------

export interface CreateRoomInput {
  title: string;
  category: string;
  visibility: 'public' | 'private';
  focus_duration?: number;
  break_duration?: number;
  long_break_duration?: number;
  long_break_interval?: number;
}

// ---------- EXP & Level System ----------

// Escalating EXP thresholds — level N requires this cumulative EXP
export const LEVEL_THRESHOLDS: number[] = [
  0,       // Level 0 (impossible, but base)
  100,     // Level 1
  350,     // Level 2
  850,     // Level 3
  1850,    // Level 4
  3850,    // Level 5
  7850,    // Level 6
  15850,   // Level 7
  31850,   // Level 8
  63850,   // Level 9
  127850,  // Level 10
  255850,  // Level 11
  511850,  // Level 12
];

export function computeLevel(exp: number): number {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (exp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function computeLevelProgress(exp: number): { level: number; currentExp: number; nextLevelExp: number; progress: number } {
  const level = computeLevel(exp);
  const currentThreshold = LEVEL_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
  const currentExp = exp - currentThreshold;
  const nextLevelExp = nextThreshold - currentThreshold;
  const progress = Math.min((currentExp / nextLevelExp) * 100, 100);
  return { level, currentExp, nextLevelExp, progress };
}

// ---------- Timer Helpers ----------

export function computeTimerRemaining(
  timerStartedAt: string | null,
  timerStatus: Room['timer_status'],
  focusDuration: number,
  breakDuration: number,
  longBreakDuration: number
): { minutes: number; seconds: number; totalRemaining: number } {
  // If no timer_started_at, timer hasn't started yet or was fully reset
  if (!timerStartedAt) {
    const dur = focusDuration;
    return { minutes: Math.floor(dur / 60), seconds: dur % 60, totalRemaining: dur };
  }

  // Timer is either running or paused (idle status with valid timer_started_at)
  // In both cases, calculate remaining time from the anchor
  let duration: number;
  switch (timerStatus) {
    case 'focus':
      duration = focusDuration;
      break;
    case 'break':
      duration = breakDuration;
      break;
    case 'long_break':
      duration = longBreakDuration;
      break;
    case 'idle':
      // Paused state - use focus duration as default
      // The actual duration was captured when timer started
      duration = focusDuration;
      break;
    default:
      duration = focusDuration;
  }

  const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000);
  const remaining = Math.max(0, duration - elapsed);

  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
    totalRemaining: remaining,
  };
}

export function formatFocusHours(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
