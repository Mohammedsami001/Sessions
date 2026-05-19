import { supabase, getCurrentSession } from "./supabase";
import type { Room, RoomParticipant, CreateRoomInput } from "./types";

// ---------- Fetch Public Rooms (Discovery Lobby) ----------

export async function fetchPublicRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch rooms:", error.message);
    return [];
  }
  return data || [];
}

// ---------- Fetch Room by ID ----------

export async function fetchRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Failed to fetch room:", error.message);
    return null;
  }
  return data;
}

// ---------- Fetch Room by Join Code ----------

export async function fetchRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("join_code", code.toUpperCase().trim())
    .single();

  if (error) {
    console.error("Failed to fetch room by code:", error.message);
    return null;
  }
  return data;
}

// ---------- Create Room ----------

export async function createRoom(input: CreateRoomInput): Promise<Room | null> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      title: input.title,
      category: input.category,
      host_id: session.user.id,
      visibility: input.visibility,
      focus_duration: input.focus_duration || 1500,
      break_duration: input.break_duration || 300,
      long_break_duration: input.long_break_duration || 900,
      long_break_interval: input.long_break_interval || 4,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create room:", error.message);
    return null;
  }

  // Auto-join the creator as the first participant
  if (data) {
    await joinRoom(data.id);
  }

  return data;
}

// ---------- Join Room ----------

export async function joinRoom(
  roomId: string,
): Promise<RoomParticipant | null> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("room_participants")
    .upsert(
      { room_id: roomId, user_id: session.user.id },
      { onConflict: "room_id,user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to join room:", error.message);
    return null;
  }
  return data;
}

// ---------- Join Room by Code ----------

export async function joinRoomByCode(
  code: string,
): Promise<{ room: Room | null; error?: string }> {
  const room = await fetchRoomByCode(code);
  if (!room)
    return {
      room: null,
      error: "Invalid room code. Please check and try again.",
    };

  const participant = await joinRoom(room.id);
  if (!participant) return { room: null, error: "Failed to join room." };

  return { room };
}

// ---------- Leave Room ----------

export async function leaveRoom(roomId: string): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return false;

  // Check if we're the host
  const { data: room } = await supabase
    .from("rooms")
    .select("host_id")
    .eq("id", roomId)
    .single();

  // Remove our participant row
  const { error } = await supabase
    .from("room_participants")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Failed to leave room:", error.message);
    return false;
  }

  // If we were the host, transfer ownership to the next oldest participant
  if (room?.host_id === session.user.id) {
    const { data: nextHost } = await supabase
      .from("room_participants")
      .select("user_id")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true })
      .limit(1)
      .single();

    if (nextHost) {
      // Transfer host
      await supabase
        .from("rooms")
        .update({ host_id: nextHost.user_id })
        .eq("id", roomId);
    } else {
      // No participants left — delete the room
      await supabase.from("rooms").delete().eq("id", roomId);
    }
  }

  return true;
}

// ---------- Delete Room (Host Only) ----------

export async function deleteRoom(roomId: string): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return false;

  // Verify the current user is the host
  const { data: room, error: fetchError } = await supabase
    .from("rooms")
    .select("host_id")
    .eq("id", roomId)
    .single();

  if (fetchError || !room || room.host_id !== session.user.id) {
    console.error("Only the host can delete a room");
    return false;
  }

  // Remove all participants first (triggers Realtime events → clients redirect)
  const { error: partError } = await supabase
    .from("room_participants")
    .delete()
    .eq("room_id", roomId);

  if (partError) {
    console.error("Failed to remove participants:", partError.message);
    return false;
  }

  // Delete the room
  const { error: roomError } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (roomError) {
    console.error("Failed to delete room:", roomError.message);
    return false;
  }

  return true;
}

// ---------- Fetch Participants ----------

export async function fetchParticipants(roomId: string) {
  const { data, error } = await supabase
    .from("room_participants")
    .select("*, profiles(display_name, avatar_url)")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch participants:", error.message);
    return [];
  }
  return data || [];
}

// ---------- Fetch Participant Count for Multiple Rooms ----------

export async function fetchParticipantCounts(
  roomIds: string[],
): Promise<Record<string, number>> {
  if (roomIds.length === 0) return {};

  const { data, error } = await supabase
    .from("room_participants")
    .select("room_id")
    .in("room_id", roomIds);

  if (error) {
    console.error("Failed to fetch participant counts:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  (data || []).forEach((row) => {
    counts[row.room_id] = (counts[row.room_id] || 0) + 1;
  });
  return counts;
}

// ---------- Timer Controls (Host Only) ----------

export async function startTimer(
  roomId: string,
  mode: "focus" | "break" | "long_break",
): Promise<boolean> {
  // Fetch current room state to check if we're resuming from pause
  const { data: room } = await supabase
    .from("rooms")
    .select("timer_started_at, timer_status")
    .eq("id", roomId)
    .single();

  let timerStartedAt: string;

  if (room?.timer_status === "idle" && room?.timer_started_at) {
    // Resuming from pause - preserve the anchor to keep remaining time
    // Adjust the anchor to now minus the already-elapsed time
    const elapsed = Math.floor(
      (Date.now() - new Date(room.timer_started_at).getTime()) / 1000,
    );
    const newAnchor = new Date(Date.now() - elapsed * 1000).toISOString();
    timerStartedAt = newAnchor;
  } else {
    // Starting fresh
    timerStartedAt = new Date().toISOString();
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      timer_status: mode,
      timer_started_at: timerStartedAt,
    })
    .eq("id", roomId);

  if (error) {
    console.error("Failed to start timer:", error.message);
    return false;
  }
  return true;
}

export async function pauseTimer(roomId: string): Promise<boolean> {
  const { error } = await supabase
    .from("rooms")
    .update({
      timer_status: "idle",
      // Keep timer_started_at to preserve remaining time for resume
    })
    .eq("id", roomId);

  if (error) {
    console.error("Failed to pause timer:", error.message);
    return false;
  }
  return true;
}

export async function resetTimer(roomId: string): Promise<boolean> {
  const { error } = await supabase
    .from("rooms")
    .update({
      timer_status: "idle",
      timer_started_at: null,
      cycles_completed: 0,
    })
    .eq("id", roomId);

  if (error) {
    console.error("Failed to reset timer:", error.message);
    return false;
  }
  return true;
}

export async function completeTimerCycle(
  roomId: string,
  nextMode: "break" | "long_break",
): Promise<boolean> {
  // First update status to trigger the focus_complete trigger
  const { data: room } = await supabase
    .from("rooms")
    .select("cycles_completed")
    .eq("id", roomId)
    .single();

  const newCycles = (room?.cycles_completed || 0) + 1;

  const { error } = await supabase
    .from("rooms")
    .update({
      timer_status: nextMode,
      timer_started_at: new Date().toISOString(),
      cycles_completed: newCycles,
    })
    .eq("id", roomId);

  if (error) {
    console.error("Failed to complete cycle:", error.message);
    return false;
  }
  return true;
}

// ---------- Switch Timer Mode (While Paused) ----------

export async function switchTimerMode(
  roomId: string,
  newMode: "focus" | "break" | "long_break",
): Promise<boolean> {
  const { error } = await supabase
    .from("rooms")
    .update({
      timer_status: newMode,
    })
    .eq("id", roomId);

  if (error) {
    console.error("Failed to switch timer mode:", error.message);
    return false;
  }
  return true;
}

// ---------- Realtime Subscriptions ----------

export function subscribeToRoom(
  roomId: string,
  callback: (room: Room) => void,
) {
  return supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => callback(payload.new as Room),
    )
    .subscribe();
}

export function subscribeToParticipants(roomId: string, callback: () => void) {
  return supabase
    .channel(`participants-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_participants",
        filter: `room_id=eq.${roomId}`,
      },
      () => callback(),
    )
    .subscribe();
}

export function subscribeToPublicRooms(callback: () => void) {
  return supabase
    .channel("public-rooms")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms" },
      () => callback(),
    )
    .subscribe();
}

export function subscribeToPublicParticipants(callback: () => void) {
  return supabase
    .channel("public-participants")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_participants" },
      () => callback(),
    )
    .subscribe();
}
