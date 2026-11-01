import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const adminSecret = Deno.env.get("ADMIN_SECRET");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!adminSecret || !url || !serviceKey) return json({ error: "Server configuration incomplete" }, 500);
  const supplied = req.headers.get("x-admin-key") || "";
  if (supplied.length < 32 || supplied !== adminSecret) return json({ error: "رابط الإدارة غير صحيح" }, 401);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  try {
    const body = await req.json();
    if (body.action === "save") {
      if (!body.content || typeof body.content !== "object") return json({ error: "محتوى غير صالح" }, 400);
      const { error } = await supabase.from("love_page").upsert({ id: "fatma", content: body.content, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }
    if (body.action === "upload") {
      if (!body.fileBase64 || !body.filename || !String(body.contentType).startsWith("image/")) return json({ error: "ملف صورة غير صالح" }, 400);
      const bytes = Uint8Array.from(atob(body.fileBase64), c => c.charCodeAt(0));
      if (bytes.length > 8 * 1024 * 1024) return json({ error: "حجم الصورة أكبر من 8 ميجابايت" }, 413);
      const ext = String(body.filename).split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("fatma-photos").upload(path, bytes, { contentType: body.contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("fatma-photos").getPublicUrl(path);
      return json({ ok: true, url: data.publicUrl });
    }
    return json({ error: "Action not supported" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "حصل خطأ أثناء تنفيذ الطلب" }, 500);
  }
});
