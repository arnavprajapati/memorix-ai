-- ============================================================
-- Memorix — Initial Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Table: decks
-- ────────────────────────────────────────────────────────────
create table if not exists public.decks (
    id          uuid        primary key default gen_random_uuid(),
    user_id     uuid        not null references auth.users(id) on delete cascade,
    name        text        not null,
    description text,
    card_count  integer     not null default 0,
    created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- Table: cards
-- ────────────────────────────────────────────────────────────
create table if not exists public.cards (
    id           uuid        primary key default gen_random_uuid(),
    deck_id      uuid        not null references public.decks(id) on delete cascade,
    user_id      uuid        not null references auth.users(id) on delete cascade,
    front        text        not null,
    back         text        not null,
    hint         text,
    due_date     date        not null default current_date,
    interval     integer     not null default 1,
    ease_factor  float       not null default 2.5,
    repetitions  integer     not null default 0,
    pinecone_id  text,
    created_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- Table: study_logs
-- ────────────────────────────────────────────────────────────
create table if not exists public.study_logs (
    id          uuid        primary key default gen_random_uuid(),
    card_id     uuid        not null references public.cards(id) on delete cascade,
    user_id     uuid        not null references auth.users(id) on delete cascade,
    rating      integer     not null check (rating between 0 and 3),
    reviewed_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
create index if not exists idx_cards_user_due    on public.cards (user_id, due_date);
create index if not exists idx_cards_deck        on public.cards (deck_id);
create index if not exists idx_study_logs_card   on public.study_logs (card_id);

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
alter table public.decks      enable row level security;
alter table public.cards      enable row level security;
alter table public.study_logs enable row level security;

-- decks policies
create policy "decks: select own"  on public.decks for select using (user_id = auth.uid());
create policy "decks: insert own"  on public.decks for insert with check (user_id = auth.uid());
create policy "decks: update own"  on public.decks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "decks: delete own"  on public.decks for delete using (user_id = auth.uid());

-- cards policies
create policy "cards: select own"  on public.cards for select using (user_id = auth.uid());
create policy "cards: insert own"  on public.cards for insert with check (user_id = auth.uid());
create policy "cards: update own"  on public.cards for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cards: delete own"  on public.cards for delete using (user_id = auth.uid());

-- study_logs policies
create policy "logs: select own"   on public.study_logs for select using (user_id = auth.uid());
create policy "logs: insert own"   on public.study_logs for insert with check (user_id = auth.uid());
create policy "logs: update own"   on public.study_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "logs: delete own"   on public.study_logs for delete using (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- Auto-sync card_count on decks via trigger
-- ────────────────────────────────────────────────────────────
create or replace function public.sync_deck_card_count()
returns trigger
language plpgsql
security definer
as $$
begin
    if tg_op = 'INSERT' then
        update public.decks set card_count = card_count + 1 where id = new.deck_id;
    elsif tg_op = 'DELETE' then
        update public.decks set card_count = greatest(card_count - 1, 0) where id = old.deck_id;
    end if;
    return null;
end;
$$;

create trigger trg_card_count_insert
    after insert on public.cards
    for each row execute function public.sync_deck_card_count();

create trigger trg_card_count_delete
    after delete on public.cards
    for each row execute function public.sync_deck_card_count();
