-- ============================================================================
-- SurveyLand: Row Level Security, triggers and RPCs
--
-- Additive migration only. It does not drop tables/columns or delete data.
-- The database had RLS enabled with zero policies, so every table was
-- inaccessible from anon/authenticated. This file adds owner-scoped access,
-- a signup profile trigger, and safe RPCs for public survey reads/submission.
-- Public (anon) users never get direct table access; they can only call
-- get_public_survey() and submit_survey_response(), both SECURITY DEFINER.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Supporting indexes (owner-scoped lists + analytics aggregations)
-- ---------------------------------------------------------------------------
create index if not exists surveys_owner_id_idx
  on public.surveys (owner_id);

create index if not exists questions_survey_position_idx
  on public.questions (survey_id, position);

create index if not exists responses_survey_submitted_idx
  on public.responses (survey_id, submitted_at desc);

create index if not exists response_answers_response_id_idx
  on public.response_answers (response_id);

create index if not exists activity_events_owner_created_idx
  on public.activity_events (owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Profiles: a user may only read/update their own profile
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Surveys: owners manage their own surveys
-- ---------------------------------------------------------------------------
drop policy if exists "surveys_select_own" on public.surveys;
create policy "surveys_select_own"
  on public.surveys for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "surveys_insert_own" on public.surveys;
create policy "surveys_insert_own"
  on public.surveys for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "surveys_update_own" on public.surveys;
create policy "surveys_update_own"
  on public.surveys for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "surveys_delete_own" on public.surveys;
create policy "surveys_delete_own"
  on public.surveys for delete to authenticated
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Questions: reachable only through a survey owned by the caller
-- ---------------------------------------------------------------------------
drop policy if exists "questions_select_own" on public.questions;
create policy "questions_select_own"
  on public.questions for select to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = questions.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "questions_insert_own" on public.questions;
create policy "questions_insert_own"
  on public.questions for insert to authenticated
  with check (exists (
    select 1 from public.surveys s
    where s.id = questions.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "questions_update_own" on public.questions;
create policy "questions_update_own"
  on public.questions for update to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = questions.survey_id and s.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.surveys s
    where s.id = questions.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "questions_delete_own" on public.questions;
create policy "questions_delete_own"
  on public.questions for delete to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = questions.survey_id and s.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Question options: reachable only through an owned survey
-- ---------------------------------------------------------------------------
drop policy if exists "question_options_select_own" on public.question_options;
create policy "question_options_select_own"
  on public.question_options for select to authenticated
  using (exists (
    select 1
    from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = question_options.question_id and s.owner_id = auth.uid()
  ));

drop policy if exists "question_options_insert_own" on public.question_options;
create policy "question_options_insert_own"
  on public.question_options for insert to authenticated
  with check (exists (
    select 1
    from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = question_options.question_id and s.owner_id = auth.uid()
  ));

drop policy if exists "question_options_update_own" on public.question_options;
create policy "question_options_update_own"
  on public.question_options for update to authenticated
  using (exists (
    select 1
    from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = question_options.question_id and s.owner_id = auth.uid()
  ))
  with check (exists (
    select 1
    from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = question_options.question_id and s.owner_id = auth.uid()
  ));

drop policy if exists "question_options_delete_own" on public.question_options;
create policy "question_options_delete_own"
  on public.question_options for delete to authenticated
  using (exists (
    select 1
    from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = question_options.question_id and s.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Responses: private to the survey owner. Public submissions go through RPC.
-- ---------------------------------------------------------------------------
drop policy if exists "responses_select_own" on public.responses;
create policy "responses_select_own"
  on public.responses for select to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = responses.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "responses_insert_own" on public.responses;
create policy "responses_insert_own"
  on public.responses for insert to authenticated
  with check (exists (
    select 1 from public.surveys s
    where s.id = responses.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "responses_update_own" on public.responses;
create policy "responses_update_own"
  on public.responses for update to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = responses.survey_id and s.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.surveys s
    where s.id = responses.survey_id and s.owner_id = auth.uid()
  ));

drop policy if exists "responses_delete_own" on public.responses;
create policy "responses_delete_own"
  on public.responses for delete to authenticated
  using (exists (
    select 1 from public.surveys s
    where s.id = responses.survey_id and s.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Response answers: private to the survey owner
-- ---------------------------------------------------------------------------
drop policy if exists "response_answers_select_own" on public.response_answers;
create policy "response_answers_select_own"
  on public.response_answers for select to authenticated
  using (exists (
    select 1
    from public.responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_answers.response_id and s.owner_id = auth.uid()
  ));

drop policy if exists "response_answers_insert_own" on public.response_answers;
create policy "response_answers_insert_own"
  on public.response_answers for insert to authenticated
  with check (exists (
    select 1
    from public.responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_answers.response_id and s.owner_id = auth.uid()
  ));

drop policy if exists "response_answers_update_own" on public.response_answers;
create policy "response_answers_update_own"
  on public.response_answers for update to authenticated
  using (exists (
    select 1
    from public.responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_answers.response_id and s.owner_id = auth.uid()
  ))
  with check (exists (
    select 1
    from public.responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_answers.response_id and s.owner_id = auth.uid()
  ));

drop policy if exists "response_answers_delete_own" on public.response_answers;
create policy "response_answers_delete_own"
  on public.response_answers for delete to authenticated
  using (exists (
    select 1
    from public.responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_answers.response_id and s.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Activity events: private to the owner
-- ---------------------------------------------------------------------------
drop policy if exists "activity_events_select_own" on public.activity_events;
create policy "activity_events_select_own"
  on public.activity_events for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "activity_events_insert_own" on public.activity_events;
create policy "activity_events_insert_own"
  on public.activity_events for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "activity_events_delete_own" on public.activity_events;
create policy "activity_events_delete_own"
  on public.activity_events for delete to authenticated
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists surveys_set_updated_at on public.surveys;
create trigger surveys_set_updated_at
  before update on public.surveys
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile row whenever a Supabase auth user is created.
-- Name/company come from signup metadata when available.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_company text;
  v_role text;
begin
  v_name := coalesce(
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New user'
  );
  v_company := coalesce(new.raw_user_meta_data ->> 'company', '');
  v_role := coalesce(new.raw_user_meta_data ->> 'role', '');

  insert into public.profiles (id, name, email, company, role)
  values (new.id, v_name, coalesce(nullif(new.email, ''), new.id::text || '@local'), v_company, v_role)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public survey fetch by exact slug. Avoids exposing table SELECT to anon and
-- prevents listing/guessing other surveys. Draft surveys are never returned.
-- ---------------------------------------------------------------------------
create or replace function public.get_public_survey(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'slug', s.slug,
    'title', s.title,
    'description', s.description,
    'status', s.status::text,
    'category', s.category,
    'accent', s.accent,
    'show_progress', s.show_progress,
    'collect_email', s.collect_email,
    'thank_you_title', s.thank_you_title,
    'thank_you_message', s.thank_you_message,
    'created_at', s.created_at,
    'updated_at', s.updated_at,
    'published_at', s.published_at,
    'closed_at', s.closed_at,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'type', q.type::text,
          'title', q.title,
          'description', q.description,
          'required', q.required,
          'position', q.position,
          'options', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'label', o.label,
                'position', o.position
              ) order by o.position
            )
            from public.question_options o
            where o.question_id = q.id
          ), '[]'::jsonb)
        ) order by q.position
      )
      from public.questions q
      where q.survey_id = s.id
    ), '[]'::jsonb)
  )
  from public.surveys s
  where s.slug = p_slug
    and s.status in ('published', 'closed')
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Public submission. Validates the survey is published, that required
-- questions are answered, and that choices match real options. Inserts the
-- response, answers and an activity event atomically.
-- ---------------------------------------------------------------------------
create or replace function public.submit_survey_response(
  p_slug text,
  p_name text,
  p_email text,
  p_duration_seconds integer,
  p_device text,
  p_answers jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_survey public.surveys%rowtype;
  v_response_id text;
  v_question record;
  v_answer text;
  v_option_id text;
  v_total integer := 0;
  v_answered integer := 0;
  v_completion integer := 0;
  v_device public.response_device;
  v_name text;
begin
  select * into v_survey
  from public.surveys
  where slug = p_slug;

  if not found then
    raise exception 'Survey not found.' using errcode = 'P0002';
  end if;

  if v_survey.status <> 'published' then
    raise exception 'This survey is not accepting responses.' using errcode = 'P0001';
  end if;

  v_device := case lower(coalesce(p_device, 'desktop'))
    when 'mobile' then 'Mobile'::public.response_device
    when 'tablet' then 'Tablet'::public.response_device
    else 'Desktop'::public.response_device
  end;

  select count(*) into v_total
  from public.questions
  where survey_id = v_survey.id;

  -- Validate before writing anything.
  for v_question in
    select id, type, required
    from public.questions
    where survey_id = v_survey.id
    order by position
  loop
    v_answer := nullif(btrim(coalesce(p_answers ->> v_question.id, '')), '');

    if v_answer is null then
      if v_question.required then
        raise exception 'Please answer all required questions.' using errcode = 'P0001';
      end if;
      continue;
    end if;

    if v_question.type = 'multiple_choice' then
      select id into v_option_id
      from public.question_options
      where question_id = v_question.id and label = v_answer
      limit 1;

      if v_option_id is null then
        raise exception 'An answer does not match the available options.' using errcode = 'P0001';
      end if;
    elsif char_length(v_answer) > 5000 then
      raise exception 'An answer is too long.' using errcode = 'P0001';
    end if;

    v_answered := v_answered + 1;
  end loop;

  if v_total > 0 then
    v_completion := round((v_answered::numeric / v_total::numeric) * 100)::integer;
  else
    v_completion := 100;
  end if;

  v_response_id := 'res_' || replace(gen_random_uuid()::text, '-', '');
  v_name := coalesce(
    nullif(btrim(coalesce(p_name, '')), ''),
    nullif(split_part(coalesce(p_email, ''), '@', 1), ''),
    'Anonymous'
  );

  insert into public.responses (
    id, survey_id, name, email, completion, duration_seconds, device, submitted_at
  ) values (
    v_response_id,
    v_survey.id,
    v_name,
    nullif(btrim(coalesce(p_email, '')), ''),
    v_completion,
    greatest(coalesce(p_duration_seconds, 0), 0),
    v_device,
    now()
  );

  for v_question in
    select id, type
    from public.questions
    where survey_id = v_survey.id
    order by position
  loop
    v_answer := nullif(btrim(coalesce(p_answers ->> v_question.id, '')), '');
    if v_answer is null then
      continue;
    end if;

    if v_question.type = 'multiple_choice' then
      select id into v_option_id
      from public.question_options
      where question_id = v_question.id and label = v_answer
      limit 1;

      insert into public.response_answers (response_id, question_id, option_id)
      values (v_response_id, v_question.id, v_option_id);
    else
      insert into public.response_answers (response_id, question_id, text_value)
      values (v_response_id, v_question.id, v_answer);
    end if;
  end loop;

  insert into public.activity_events (
    id, owner_id, survey_id, type, survey_title, message
  ) values (
    'evt_' || replace(gen_random_uuid()::text, '-', ''),
    v_survey.owner_id,
    v_survey.id,
    'response',
    v_survey.title,
    v_name || ' submitted a response to "' || v_survey.title || '".'
  );

  return v_response_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Duplicate a survey (with questions/options) as a new draft.
-- ---------------------------------------------------------------------------
create or replace function public.duplicate_survey(p_survey_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source public.surveys%rowtype;
  v_new_id text;
  v_new_slug text;
  v_base_slug text;
  v_suffix integer := 1;
  v_question record;
  v_option record;
  v_new_question_id text;
begin
  select * into v_source
  from public.surveys
  where id = p_survey_id and owner_id = auth.uid();

  if not found then
    raise exception 'Survey not found.' using errcode = 'P0002';
  end if;

  v_new_id := 'srv_' || replace(gen_random_uuid()::text, '-', '');
  v_base_slug := v_source.slug || '-copy';
  v_new_slug := v_base_slug;

  while exists (select 1 from public.surveys where slug = v_new_slug) loop
    v_suffix := v_suffix + 1;
    v_new_slug := v_base_slug || '-' || v_suffix::text;
  end loop;

  insert into public.surveys (
    id, owner_id, slug, title, description, status, category, accent,
    show_progress, collect_email, thank_you_title, thank_you_message,
    published_at, closed_at
  ) values (
    v_new_id, auth.uid(), v_new_slug, v_source.title || ' (copy)',
    v_source.description, 'draft', v_source.category, v_source.accent,
    v_source.show_progress, v_source.collect_email,
    v_source.thank_you_title, v_source.thank_you_message,
    null, null
  );

  for v_question in
    select * from public.questions
    where survey_id = v_source.id
    order by position
  loop
    v_new_question_id := 'q_' || replace(gen_random_uuid()::text, '-', '');

    insert into public.questions (
      id, survey_id, type, title, description, required, position
    ) values (
      v_new_question_id, v_new_id, v_question.type, v_question.title,
      v_question.description, v_question.required, v_question.position
    );

    for v_option in
      select * from public.question_options
      where question_id = v_question.id
      order by position
    loop
      insert into public.question_options (id, question_id, label, position)
      values (
        'opt_' || replace(gen_random_uuid()::text, '-', ''),
        v_new_question_id,
        v_option.label,
        v_option.position
      );
    end loop;
  end loop;

  insert into public.activity_events (
    id, owner_id, survey_id, type, survey_title, message
  ) values (
    'evt_' || replace(gen_random_uuid()::text, '-', ''),
    auth.uid(),
    v_new_id,
    'duplicated',
    v_source.title || ' (copy)',
    'Duplicated "' || v_source.title || '".'
  );

  return v_new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reorder questions. Uses a two-phase negative offset to avoid colliding with
-- the (survey_id, position) unique constraint.
-- ---------------------------------------------------------------------------
create or replace function public.reorder_questions(
  p_survey_id text,
  p_question_ids text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  i integer;
  v_count integer := coalesce(array_length(p_question_ids, 1), 0);
  v_distinct integer;
begin
  select owner_id into v_owner
  from public.surveys
  where id = p_survey_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Survey not found.' using errcode = 'P0002';
  end if;

  if v_count <> (select count(*) from public.questions where survey_id = p_survey_id) then
    raise exception 'Question list is out of date.' using errcode = 'P0001';
  end if;

  select count(distinct x) into v_distinct from unnest(p_question_ids) as x;
  if v_distinct <> v_count then
    raise exception 'Question list contains duplicates.' using errcode = 'P0001';
  end if;

  for i in 1..v_count loop
    update public.questions
    set position = -i
    where survey_id = p_survey_id and id = p_question_ids[i];

    if not found then
      raise exception 'Question does not belong to this survey.' using errcode = 'P0001';
    end if;
  end loop;

  for i in 1..v_count loop
    update public.questions
    set position = i
    where survey_id = p_survey_id and id = p_question_ids[i];
  end loop;

  update public.surveys set updated_at = now() where id = p_survey_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant execute on function public.get_public_survey(text) to anon, authenticated;
grant execute on function public.submit_survey_response(text, text, text, integer, text, jsonb) to anon, authenticated;
grant execute on function public.duplicate_survey(text) to authenticated;
grant execute on function public.reorder_questions(text, text[]) to authenticated;
