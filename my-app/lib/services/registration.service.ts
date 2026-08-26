import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlayersRepository } from "@/lib/repositories/players.repository";
import { RegistrationsRepository } from "@/lib/repositories/registrations.repository";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

export async function registerForSession(input: {
  session_id: string;
  name: string;
  line_name: string;
  level: number;
  notes: string | null;
}) {
  const db = createAdminClient();
  const playersRepo = new PlayersRepository(db);
  const registrationsRepo = new RegistrationsRepository(db);

  let player = await playersRepo.findByNameAndLine(input.name, input.line_name);
  if (player) {
    if (player.level !== input.level) {
      await playersRepo.updateLevel(player.id, input.level);
    }
  } else {
    player = await playersRepo.create({
      name: input.name,
      line_name: input.line_name,
      level: input.level,
    });
  }

  try {
    return await registrationsRepo.create({
      session_id: input.session_id,
      player_id: player.id,
      notes: input.notes,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("คุณลงทะเบียนรอบนี้ไปแล้ว");
    }
    throw error;
  }
}
