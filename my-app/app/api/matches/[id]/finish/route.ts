import { NextResponse } from "next/server";
import { getCurrentStaffRole } from "@/lib/auth";
import { finishMatch } from "@/lib/services/queue.service";
import { errorMessage } from "@/lib/errors";
import type { MatchResult } from "@/lib/types/database";

const VALID_RESULTS: MatchResult[] = ["team_a", "team_b", "draw"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await getCurrentStaffRole();
  if (!role) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = body?.result as MatchResult;
  const scoreA = body?.score_a === "" || body?.score_a == null ? null : Number(body.score_a);
  const scoreB = body?.score_b === "" || body?.score_b == null ? null : Number(body.score_b);

  if (!VALID_RESULTS.includes(result)) {
    return NextResponse.json({ error: "กรุณาเลือกผลการแข่งขัน" }, { status: 400 });
  }

  try {
    const match = await finishMatch(id, {
      result,
      score_a: Number.isFinite(scoreA) ? scoreA : null,
      score_b: Number.isFinite(scoreB) ? scoreB : null,
    });
    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "บันทึกผลไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
