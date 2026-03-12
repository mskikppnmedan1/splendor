import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, profil, nama_satker, kode_satker } = body;

  // Update status satker (dari Kelola User)
  if (status !== undefined) {
    const { error } = await supabase.from("profiles_satker").update({ status }).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Update nama dan/atau kode satker (dari import Excel)
  if (nama_satker !== undefined || kode_satker !== undefined) {
    const updateData: Record<string, string> = {};
    if (nama_satker !== undefined) updateData.nama_satker = nama_satker;
    if (kode_satker !== undefined) updateData.kode_satker = kode_satker;

    const { error: profileError } = await supabase
      .from("profiles_satker")
      .update(updateData)
      .eq("id", id);

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

    // Sinkron kode_satker di tabel users juga
    if (kode_satker !== undefined) {
      await supabase
        .from("users")
        .update({ username: kode_satker, kode_satker })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  }

  // Update profil satker (dari Edit admin KPPN / satker itu sendiri)
  if (profil !== undefined) {
    const { data: existing } = await supabase.from("profil_satker").select("id").eq("id", id).single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("profil_satker")
        .update({ ...profil })
        .eq("id", id));
    } else {
      ({ error } = await supabase.from("profil_satker").insert({ id, ...profil }));
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
}