// Supabase โยน error เป็น plain object ({ message, code, ... }) ไม่ใช่ instanceof Error
// ฟังก์ชันนี้ดึงข้อความที่อ่านได้ออกมาไม่ว่าจะโดนโยนแบบไหน
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}
