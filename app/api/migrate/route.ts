import { NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

export async function POST() {
  // Add column if missing (ignore error if it already exists)
  try {
    await d1Query("ALTER TABLE products ADD COLUMN code INTEGER");
  } catch {
    // column already exists — ok
  }

  // Backfill code for any products that still have NULL
  try {
    const result = await d1Query<{ id: string }>(
      "SELECT id FROM products WHERE code IS NULL ORDER BY created_at ASC",
    );
    const rows = result.results;

    if (rows.length > 0) {
      // Find the current max code so we don't collide with already-assigned codes
      const maxResult = await d1Query<{ max_code: number }>(
        "SELECT COALESCE(MAX(code), 0) AS max_code FROM products WHERE code IS NOT NULL",
      );
      let nextCode = (maxResult.results[0]?.max_code ?? 0) + 1;

      for (const row of rows) {
        await d1Query("UPDATE products SET code = ? WHERE id = ?", [
          nextCode,
          row.id,
        ]);
        nextCode++;
      }
    }

    return NextResponse.json({ success: true, backfilled: rows.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
