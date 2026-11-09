-- Migrate existing question types to the richer three-type model.
update public.questions
set type = 'single_choice'
where type = 'multiple_choice';

update public.questions
set type = 'long_answer'
where type = 'text';

-- Multiple-answer questions store one row per selected option, so the
-- one-answer-per-question uniqueness no longer applies.
alter table public.response_answers
  drop constraint if exists response_answers_response_id_question_id_key;

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
  v_value jsonb;
  v_answer text;
  v_label text;
  v_option_id text;
  v_answered_question boolean;
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
    v_value := p_answers -> v_question.id;
    v_answered_question := false;

    if v_value is not null and jsonb_typeof(v_value) = 'array' then
      for v_label in select jsonb_array_elements_text(v_value)
      loop
        v_answer := nullif(btrim(v_label), '');
        if v_answer is null then
          continue;
        end if;

        v_answered_question := true;

        if v_question.type in ('single_choice', 'multiple_choice') then
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
      end loop;
    else
      v_answer := nullif(btrim(coalesce(v_value #>> '{}', '')), '');
      if v_answer is not null then
        v_answered_question := true;

        if v_question.type in ('single_choice', 'multiple_choice') then
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
      end if;
    end if;

    if not v_answered_question then
      if v_question.required then
        raise exception 'Please answer all required questions.' using errcode = 'P0001';
      end if;
      continue;
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
    v_value := p_answers -> v_question.id;
    if v_value is null then
      continue;
    end if;

    if jsonb_typeof(v_value) = 'array' then
      for v_label in select jsonb_array_elements_text(v_value)
      loop
        v_answer := nullif(btrim(v_label), '');
        if v_answer is null then
          continue;
        end if;

        if v_question.type in ('single_choice', 'multiple_choice') then
          select id into v_option_id
          from public.question_options
          where question_id = v_question.id and label = v_answer
          limit 1;

          if v_option_id is not null then
            insert into public.response_answers (response_id, question_id, option_id)
            values (v_response_id, v_question.id, v_option_id);
          end if;
        else
          insert into public.response_answers (response_id, question_id, text_value)
          values (v_response_id, v_question.id, v_answer);
        end if;
      end loop;
    else
      v_answer := nullif(btrim(coalesce(v_value #>> '{}', '')), '');
      if v_answer is null then
        continue;
      end if;

      if v_question.type in ('single_choice', 'multiple_choice') then
        select id into v_option_id
        from public.question_options
        where question_id = v_question.id and label = v_answer
        limit 1;

        if v_option_id is not null then
          insert into public.response_answers (response_id, question_id, option_id)
          values (v_response_id, v_question.id, v_option_id);
        end if;
      else
        insert into public.response_answers (response_id, question_id, text_value)
        values (v_response_id, v_question.id, v_answer);
      end if;
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

grant execute on function public.submit_survey_response(text, text, text, integer, text, jsonb) to anon, authenticated;
