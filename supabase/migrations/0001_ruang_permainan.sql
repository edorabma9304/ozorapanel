-- Ruang permainan Jelajah Dunia.
--
-- Satu baris = satu ruang. Seluruh keadaan disimpan sebagai JSON supaya
-- bentuknya sama persis dengan tipe `Ruang` di klien, jadi tidak ada lapisan
-- pemetaan yang bisa ketinggalan saat aturan berubah.
--
-- RLS menyala TANPA satu pun policy: artinya kunci anon tidak bisa menyentuh
-- tabel ini sama sekali. Satu-satunya jalan masuk adalah Edge Function `ruang`
-- yang memakai service role dan menegakkan siapa boleh melakukan apa.

create table if not exists public.ruang_permainan (
  kode        text primary key,
  ruang       jsonb       not null,
  urut        integer     not null default 0,
  dibuat      timestamptz not null default now(),
  diperbarui  timestamptz not null default now()
);

alter table public.ruang_permainan enable row level security;

create index if not exists ruang_permainan_diperbarui_idx
  on public.ruang_permainan (diperbarui);

-- Ruang yang tidak tersentuh sehari dibuang. Jadwalkan lewat pg_cron:
--   select cron.schedule('bersihkan-ruang', '0 * * * *', 'select public.bersihkan_ruang()');
create or replace function public.bersihkan_ruang()
returns integer
language sql
security definer
set search_path = public
as $$
  with dibuang as (
    delete from public.ruang_permainan
    where diperbarui < now() - interval '24 hours'
    returning 1
  )
  select count(*)::integer from dibuang;
$$;
