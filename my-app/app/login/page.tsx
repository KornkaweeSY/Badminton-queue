import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
        <p className="text-sm text-muted">สำหรับผู้ดูแลระบบและ staff เท่านั้น</p>
      </div>

      <LoginForm />
    </main>
  );
}
