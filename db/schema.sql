-- MicroPromote multi-tenant schema for Supabase.
-- Run in the Supabase SQL editor against a fresh project.

create extension if not exists "pgcrypto";

-- Organisations -----------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now(),
  created_by  uuid not null references auth.users(id) on delete cascade
);

-- Memberships (user <-> org with role) -----------------------------------
create type org_role as enum ('owner', 'admin', 'approver', 'member');

create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        org_role not null default 'member',
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

-- Social posts awaiting approval ------------------------------------------
create type post_status   as enum ('pending', 'approved', 'rejected');
create type post_platform as enum ('linkedin', 'facebook', 'instagram', 'twitter');
create type post_asset    as enum ('image', 'video');

create table if not exists public.social_posts (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  author_id      uuid not null references auth.users(id) on delete cascade,
  reviewer_id    uuid references auth.users(id),
  status         post_status not null default 'pending',
  platform       post_platform not null,
  headline       text,
  caption        text not null,
  asset_url      text,
  asset_kind     post_asset,
  scheduled_for  timestamptz,
  review_notes   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists social_posts_org_status_idx
  on public.social_posts (org_id, status, created_at desc);

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists social_posts_touch on public.social_posts;
create trigger social_posts_touch
  before update on public.social_posts
  for each row execute procedure public.touch_updated_at();

-- Helper: is the calling user a member of org? ----------------------------
create or replace function public.is_member(p_org uuid) returns boolean as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid()
  );
$$ language sql stable security definer;

create or replace function public.has_role(p_org uuid, p_roles org_role[]) returns boolean as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid() and role = any(p_roles)
  );
$$ language sql stable security definer;

-- Row Level Security ------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.memberships   enable row level security;
alter table public.social_posts  enable row level security;

-- Orgs: members can read; anyone authenticated can create one they own
drop policy if exists "orgs_select" on public.organizations;
create policy "orgs_select" on public.organizations for select
  using (public.is_member(id));

drop policy if exists "orgs_insert" on public.organizations;
create policy "orgs_insert" on public.organizations for insert
  with check (created_by = auth.uid());

drop policy if exists "orgs_update" on public.organizations;
create policy "orgs_update" on public.organizations for update
  using (public.has_role(id, array['owner','admin']::org_role[]));

-- Memberships: members see, owners/admins modify; allow self-insert of
-- creator's first membership so org creation can bootstrap.
drop policy if exists "memberships_select" on public.memberships;
create policy "memberships_select" on public.memberships for select
  using (public.is_member(org_id));

drop policy if exists "memberships_insert_self" on public.memberships;
create policy "memberships_insert_self" on public.memberships for insert
  with check (
    user_id = auth.uid()
    or public.has_role(org_id, array['owner','admin']::org_role[])
  );

drop policy if exists "memberships_update" on public.memberships;
create policy "memberships_update" on public.memberships for update
  using (public.has_role(org_id, array['owner','admin']::org_role[]));

drop policy if exists "memberships_delete" on public.memberships;
create policy "memberships_delete" on public.memberships for delete
  using (public.has_role(org_id, array['owner','admin']::org_role[]));

-- Posts: org members read everything; only approvers/admins/owners decide.
drop policy if exists "posts_select" on public.social_posts;
create policy "posts_select" on public.social_posts for select
  using (public.is_member(org_id));

drop policy if exists "posts_insert" on public.social_posts;
create policy "posts_insert" on public.social_posts for insert
  with check (public.is_member(org_id) and author_id = auth.uid());

drop policy if exists "posts_update_author" on public.social_posts;
create policy "posts_update_author" on public.social_posts for update
  using (author_id = auth.uid() and status = 'pending');

drop policy if exists "posts_review" on public.social_posts;
create policy "posts_review" on public.social_posts for update
  using (public.has_role(org_id, array['owner','admin','approver']::org_role[]));

-- Bootstrap: trigger to auto-create owner membership on org insert -------
create or replace function public.bootstrap_org_owner() returns trigger as $$
begin
  insert into public.memberships (org_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists organizations_bootstrap on public.organizations;
create trigger organizations_bootstrap
  after insert on public.organizations
  for each row execute procedure public.bootstrap_org_owner();
