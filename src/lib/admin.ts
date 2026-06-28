import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!configuredPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (!providedPassword || providedPassword !== configuredPassword) {
    return NextResponse.json({ error: "管理员密码错误。" }, { status: 401 });
  }

  return null;
}
