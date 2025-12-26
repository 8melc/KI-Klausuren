import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { credits } = await req.json().catch(() => ({ credits: 0 }));
  const amount = typeof credits === "number" && credits > 0 ? credits : 25;

  const { error: updateError } = await supabase.rpc("add_credits", {
    user_id: user.id,
    amount,
  });

  if (updateError) {
    console.error("add_credits error:", updateError);
    return NextResponse.json(
      { error: "Credits konnten nicht verbucht werden" },
      { status: 500 },
    );
  }

  // Optional: letztes Kaufdatum speichern
  const { error: profileError } = await supabase
    .from("users")
    .update({
      last_credits_purchase_at: new Date().toISOString(),
      // last_credits_amount: amount, // entfernt, Spalte gibt es nicht
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("update user purchase info error:", profileError);
  }

  return NextResponse.json({ success: true, creditsAdded: amount });
}




