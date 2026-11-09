-- ============================================================================
-- Prevent builder saves from failing on the global unique surveys.slug
-- constraint. The client tries to keep slugs unique, but a stale workspace
-- snapshot or a concurrent create can still send an already-used slug. Resolve
-- the collision inside the same transaction instead of returning a 409.
-- ============================================================================

create or replace function public.save_survey_tree(p_survey jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_id text := p_survey ->> 'id';
  v_slug text := coalesce(nullif(trim(p_survey ->> 'slug'), ''), 'survey');
  v_base_slug text := v_slug;
  v_slug_suffix integer := 2;
  v_question jsonb;
  v_option jsonb;
  v_q_index integer := 0;
  v_o_index integer;
  v_q_id text;
  v_q_ids text[] := '{}';
  v_option_ids text[] := '{}';
begin
  if v_owner is null then
    raise exception 'You must be signed in.' using errcode = '28000';
  end if;

  if v_id is null or v_id = '' then
    raise exception 'Survey id is required.' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.surveys
    where id = v_id and owner_id <> v_owner
  ) then
    raise exception 'Survey not found.' using errcode = 'P0002';
  end if;

  while exists (
    select 1 from public.surveys
    where slug = v_slug and id <> v_id
  ) loop
    v_slug := v_base_slug || '-' || v_slug_suffix;
    v_slug_suffix := v_slug_suffix + 1;
  end loop;

  -- Move existing question positions out of the way so reordering cannot
  -- violate the unique (survey_id, position) constraint mid-save.
  update public.questions
  set position = position + 1000000
  where survey_id = v_id;

  insert into public.surveys (
    id, owner_id, slug, title, description, status, category, accent,
    show_progress, collect_email, thank_you_title, thank_you_message,
    published_at, closed_at, created_at, updated_at
  ) values (
    v_id,
    v_owner,
    v_slug,
    p_survey ->> 'title',
    coalesce(p_survey ->> 'description', ''),
    coalesce((p_survey ->> 'status')::public.survey_status, 'draft'),
    p_survey ->> 'category',
    coalesce(p_survey ->> 'accent', '#0d5947'),
    coalesce((p_survey ->> 'show_progress')::boolean, true),
    coalesce((p_survey ->> 'collect_email')::boolean, false),
    coalesce(p_survey ->> 'thank_you_title', ''),
    coalesce(p_survey ->> 'thank_you_message', ''),
    nullif(p_survey ->> 'published_at', '')::timestamptz,
    nullif(p_survey ->> 'closed_at', '')::timestamptz,
    now(),
    now()
  )
  on conflict (id) do update set
    slug = excluded.slug,
    title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    category = excluded.category,
    accent = excluded.accent,
    show_progress = excluded.show_progress,
    collect_email = excluded.collect_email,
    thank_you_title = excluded.thank_you_title,
    thank_you_message = excluded.thank_you_message,
    published_at = excluded.published_at,
    closed_at = excluded.closed_at,
    updated_at = now();

  -- Move existing option positions out of the way as well.
  update public.question_options o
  set position = o.position + 1000000
  where o.question_id in (
    select id from public.questions where survey_id = v_id
  );

  for v_question in
    select value from jsonb_array_elements(coalesce(p_survey -> 'questions', '[]'::jsonb))
  loop
    v_q_index := v_q_index + 1;
    v_q_id := v_question ->> 'id';

    if v_q_id is null or v_q_id = '' then
      raise exception 'Question id is required.' using errcode = 'P0001';
    end if;

    -- Never allow an id owned by another workspace to be hijacked.
    if exists (
      select 1
      from public.questions q
      join public.surveys s on s.id = q.survey_id
      where q.id = v_q_id and s.owner_id <> v_owner
    ) then
      raise exception 'Question not found.' using errcode = 'P0002';
    end if;

    v_q_ids := array_append(v_q_ids, v_q_id);

    insert into public.questions (
      id, survey_id, type, title, description, required, position
    ) values (
      v_q_id,
      v_id,
      coalesce((v_question ->> 'type')::public.question_type, 'multiple_choice'),
      coalesce(v_question ->> 'title', 'Untitled question'),
      coalesce(v_question ->> 'description', ''),
      coalesce((v_question ->> 'required')::boolean, true),
      v_q_index
    )
    on conflict (id) do update set
      survey_id = excluded.survey_id,
      type = excluded.type,
      title = excluded.title,
      description = excluded.description,
      required = excluded.required,
      position = excluded.position;

    v_o_index := 0;

    for v_option in
      select value from jsonb_array_elements(coalesce(v_question -> 'options', '[]'::jsonb))
    loop
      v_o_index := v_o_index + 1;
      v_option_ids := array_append(v_option_ids, v_option ->> 'id');

      if exists (
        select 1
        from public.question_options o
        join public.questions q on q.id = o.question_id
        join public.surveys s on s.id = q.survey_id
        where o.id = (v_option ->> 'id') and s.owner_id <> v_owner
      ) then
        raise exception 'Option not found.' using errcode = 'P0002';
      end if;

      insert into public.question_options (id, question_id, label, position)
      values (
        v_option ->> 'id',
        v_q_id,
        coalesce(v_option ->> 'label', ''),
        v_o_index
      )
      on conflict (id) do update set
        question_id = excluded.question_id,
        label = excluded.label,
        position = excluded.position;
    end loop;
  end loop;

  delete from public.question_options o
  using public.questions q
  where o.question_id = q.id
    and q.survey_id = v_id
    and not (o.id = any (v_option_ids));

  delete from public.questions q
  where q.survey_id = v_id
    and not (q.id = any (v_q_ids));
end;
$$;

grant execute on function public.save_survey_tree(jsonb) to authenticated;
