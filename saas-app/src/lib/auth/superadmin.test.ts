import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeEmail, requireSuperadmin, AUTHORIZED_SUPERADMIN_EMAIL, SUPERADMIN_ROLE } from "./superadmin";
import * as supabaseServer from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("NOTARYGO™ Single Superadmin Security Boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Test F: Email normalization handles uppercase and whitespace properly", () => {
    expect(normalizeEmail("  BungRadjen@gmail.com ")).toBe("bungradjen@gmail.com");
    expect(normalizeEmail("BUNGRADJEN@GMAIL.COM")).toBe("bungradjen@gmail.com");
    expect(normalizeEmail("other@notarygo.id")).toBe("other@notarygo.id");
  });

  it("Test A: Authorized Superadmin identity is granted access", async () => {
    const mockUser = {
      id: "b90b18b6-d0d4-42d3-b90a-818a41aa987d",
      email: AUTHORIZED_SUPERADMIN_EMAIL,
      user_metadata: { full_name: "Ezra" },
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: SUPERADMIN_ROLE, status: "ACTIVE" },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: true }),
    };

    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    const context = await requireSuperadmin({ throwOnUnauthorized: true });
    expect(context.email).toBe("bungradjen@gmail.com");
    expect(context.role).toBe("PLATFORM_SUPERADMIN");
    expect(context.userId).toBe(mockUser.id);
  });

  it("Test B & C: Tenant OWNER, ADMIN, STAFF, FINANCE must be denied (403)", async () => {
    const tenantUser = {
      id: "tenant-user-123",
      email: "notaris_owner@gmail.com",
      user_metadata: { full_name: "Notaris Owner" },
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: tenantUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: false }),
    };

    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    await expect(requireSuperadmin({ throwOnUnauthorized: true })).rejects.toThrow(
      /FORBIDDEN: User is not authorized/
    );
  });

  it("Test D: Anonymous / unauthenticated caller must be denied", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("No session") }),
      },
    };

    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    await expect(requireSuperadmin({ throwOnUnauthorized: true })).rejects.toThrow(
      /UNAUTHORIZED/
    );
  });

  it("Test E: User attempting metadata tampering is rejected if email doesn't match", async () => {
    const hackerUser = {
      id: "hacker-123",
      email: "hacker@evil.com",
      user_metadata: { role: "PLATFORM_SUPERADMIN", is_superadmin: true },
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: hackerUser }, error: null }),
      },
    };

    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    await expect(requireSuperadmin({ throwOnUnauthorized: true })).rejects.toThrow(
      /FORBIDDEN/
    );
  });
});
