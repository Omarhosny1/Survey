-- Expand the question type enum so a question can be a single-answer choice,
-- a multiple-answer choice, or a long free-text answer.
alter type public.question_type add value if not exists 'single_choice';
alter type public.question_type add value if not exists 'long_answer';
