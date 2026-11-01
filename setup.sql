-- Run this in Supabase SQL Editor.
create table if not exists public.love_page (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.love_page enable row level security;
drop policy if exists "Public can read Fatma gift" on public.love_page;
create policy "Public can read Fatma gift" on public.love_page
for select to anon, authenticated using (id = 'fatma');
-- No public INSERT/UPDATE/DELETE policies: writes must go through the protected Edge Function.
insert into public.love_page (id, content)
values ('fatma', jsonb_build_object(
'title','إلى فاطمة ♡',
'eyebrow','إلى أجمل صدفة في حياتي',
'subtitle','في كلام كتير جوايا، فقررت أعملك مكان صغير يجمع كل اللي نفسي أقولهولك.',
'letterHeading','رسالة من قلبي',
'letter','يا فاطمة، يا أجمل حاجة حصلتلي ❤️\n\nالمكان ده معمول عشانك. بحبك.',
'date','2024-01-01T00:00',
'sinceText','من يوم ما دخلتي حياتي، كل حاجة بقت ألطف.',
'galleryHeading','تفاصيل صغيرة بحبها',
'photos','[]'::jsonb,
'storyHeading','حكايتنا',
'story', '[{"date":"أول مرة","title":"بداية الحكاية","text":"من هنا بدأت حكاية نفسي تفضل مكملة العمر كله."}]'::jsonb,
'finalHeading','وآخر الكلام…',
'finalText','لو رجع بيا الزمن، هختارك تاني، وكل مرة هختارك من أول وجديد.',
'surprise','المفاجأة الحقيقية إن أجمل أيامي هي اللي فيها إنتِ. بحبك قد الدنيا كلها ❤️',
'song',''
))
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fatma-photos','fatma-photos',true,8388608,array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;
