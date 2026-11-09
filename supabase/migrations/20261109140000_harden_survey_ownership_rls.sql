-- ============================================================================
-- SurveyLand: harden survey ownership RLS.
--
-- Audit result: RLS was already enabled on public.surveys and only owner-scoped
-- policies existed. This migration makes that guarantee reproducible on every
-- environment and removes any legacy permissive policy that could OR with the
-- owner checks and expose another user's surveys.
--
-- Public survey reads and submissions use the SECURITY DEFINER functions
-- get_public_survey() / submit_survey_response(), so they are not affected by
-- the table policies below.
--
-- Additive/safe: no tables, columns or rows are dropped.
-- ============================================================================

alter table public.surveys enable row level security;

-- Drop every existing policy on surveys first. A stale "allow all" policy would
-- be OR-ed with the owner policies and leak other users' surveys.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'surveys'
  loop
    execute format('drop policy if exists %I on public.surveys', policy_row.policyname);
  end loop;
end;
$$;

-- SELECT: owners only. Anonymous users read published surveys through the
-- SECURITY DEFINER get_public_survey() RPC, never through the table.
create policy "surveys_select_own"
  on public.surveys for select to authenticated
  using (owner_id = auth.uid());

-- INSERT: the row must belong to the caller.
create policy "surveys_insert_own"
  on public.surveys for insert to authenticated
  with check (owner_id = auth.uid());

-- UPDATE: cannot read or write another user's row.
create policy "surveys_update_own"
  on public.surveys for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- DELETE: owners only.
create policy "surveys_delete_own"
  on public.surveys for delete to authenticated
  using (owner_id = auth.uid());

create index if not exists surveys_owner_id_idx
  on public.surveys (owner_id);

-- Owner-only RPCs must not be callable by anonymous visitors. They already
-- raise when auth.uid() is null, but removing the default PUBLIC grant keeps
-- the surface minimal.
revoke execute on function public.save_survey_tree(jsonb) from public;
revoke execute on function public.duplicate_survey(text) from public;
revoke execute on function public.reorder_questions(text, text[]) from public;

grant execute on function public.save_survey_tree(jsonb) to authenticated, service_role;
grant execute on function public.duplicate_survey(text) to authenticated, service_role;
grant execute on function public.reorder_questions(text, text[]) to authenticated, service_role;
