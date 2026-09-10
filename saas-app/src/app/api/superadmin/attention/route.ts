import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/superadmin";
import { SuperadminService } from "@/lib/superadmin/SuperadminService";

export async function GET(req: NextRequest) {
  try {
    await requireSuperadmin({ throwOnUnauthorized: true });
    const items = await SuperadminService.getAttentionItems();
    return NextResponse.json({ items, count: items.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Forbidden" },
      { status: err.message?.includes("UNAUTHORIZED") ? 401 : 403 }
    );
  }
}
