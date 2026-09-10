import { createClient } from "@/utils/supabase/server";

export class MatterGenerator {
  /**
   * Generates a unique sequential matter number for the organization.
   * Format: MAT-{YEAR}-{SEQUENCE}
   */
  static async generateMatterNumber(orgId: string): Promise<string> {
    const supabase = await createClient();
    const currentYear = new Date().getFullYear();

    // Query the latest matter for this year in the organization
    const { data: latestMatter, error } = await supabase
      .from("matters")
      .select("matter_number")
      .eq("org_id", orgId)
      .like("matter_number", `MAT-${currentYear}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      // Ignore not found error
      throw new Error("Failed to generate matter number");
    }

    let sequence = 1;

    if (latestMatter && latestMatter.matter_number) {
      const parts = latestMatter.matter_number.split("-");
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    // Pad sequence to 4 digits
    const paddedSequence = sequence.toString().padStart(4, "0");
    return `MAT-${currentYear}-${paddedSequence}`;
  }
}
