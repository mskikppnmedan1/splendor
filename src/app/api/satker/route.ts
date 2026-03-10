import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  console.log("Updating:", id, status);
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase.from("profiles_satker").update({ status }).eq("id", id);

  if (error) {
    console.log("Supabase error detail:", JSON.stringify(error));
    return NextResponse.json({ error: error.message, detail: error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
