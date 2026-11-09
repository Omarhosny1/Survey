CREATE SEQUENCE "public"."response_answers_id_seq" AS bigint INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1 NO CYCLE;

CREATE TABLE "public"."activity_events" (
  "id"        text NOT NULL,
  "owner_id"  uuid NOT NULL,
  "survey_id" text,
  CONSTRAINT "activity_events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."activity_events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"          uuid                     NOT NULL,
  "name"        text                     NOT NULL,
  "email"       text                     NOT NULL,
  "company"     text                     DEFAULT ''::text,
  "role"        text                     DEFAULT ''::text,
  "timezone"    text                     DEFAULT 'UTC'::text,
  "avatar"      text,
  "preferences" jsonb                    NOT NULL DEFAULT '{"newResponses": true, "reduceMotion": false, "weeklyDigest": true, "productUpdates": false}'::jsonb,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_email_key" UNIQUE (email),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."question_options" (
  "id"          text    NOT NULL,
  "question_id" text    NOT NULL,
  "label"       text    NOT NULL,
  "position"    integer NOT NULL,
  CONSTRAINT "question_options_pkey" PRIMARY KEY (id),
  CONSTRAINT "question_options_question_id_position_key" UNIQUE (question_id, "position")
);

ALTER TABLE "public"."question_options"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."questions" (
  "id"        text NOT NULL,
  "survey_id" text NOT NULL,
  CONSTRAINT "questions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."questions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."response_answers" (
  "id"          bigint NOT NULL DEFAULT nextval('public.response_answers_id_seq'::regclass),
  "response_id" text   NOT NULL,
  "question_id" text   NOT NULL,
  "option_id"   text,
  "text_value"  text,
  CONSTRAINT "response_answers_pkey" PRIMARY KEY (id),
  CONSTRAINT "response_answers_response_id_question_id_key" UNIQUE (response_id, question_id)
);

ALTER TABLE "public"."response_answers"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."responses" (
  "id"               text    NOT NULL,
  "survey_id"        text    NOT NULL,
  "name"             text,
  "email"            text,
  "completion"       integer NOT NULL DEFAULT 0,
  "duration_seconds" integer NOT NULL DEFAULT 0,
  CONSTRAINT "responses_completion_check" CHECK (((completion >= 0) AND (completion <= 100))),
  CONSTRAINT "responses_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."responses"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."surveys" (
  "id"          text NOT NULL,
  "owner_id"    uuid NOT NULL,
  "slug"        text NOT NULL,
  "title"       text NOT NULL,
  "description" text NOT NULL DEFAULT ''::text,
  CONSTRAINT "surveys_pkey" PRIMARY KEY (id),
  CONSTRAINT "surveys_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."surveys"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."response_answers_id_seq" OWNED BY "public"."response_answers"."id";

CREATE TYPE "public"."activity_type" AS ENUM (
  'published',
  'created',
  'response',
  'edited',
  'duplicated',
  'closed',
  'reopened'
);

ALTER TABLE "public"."activity_events"
  ADD COLUMN "type" public.activity_type NOT NULL;

ALTER TABLE "public"."activity_events"
  ADD COLUMN "survey_title" text NOT NULL;

ALTER TABLE "public"."activity_events"
  ADD COLUMN "message" text NOT NULL;

ALTER TABLE "public"."activity_events"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."question_type" AS ENUM (
  'multiple_choice',
  'text'
);

ALTER TABLE "public"."questions"
  ADD COLUMN "type" public.question_type NOT NULL;

ALTER TABLE "public"."questions"
  ADD COLUMN "title" text NOT NULL;

ALTER TABLE "public"."questions"
  ADD COLUMN "description" text NOT NULL DEFAULT ''::text;

ALTER TABLE "public"."questions"
  ADD COLUMN "required" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."questions"
  ADD COLUMN "position" integer NOT NULL;

CREATE TYPE "public"."response_device" AS ENUM (
  'Desktop',
  'Mobile',
  'Tablet'
);

ALTER TABLE "public"."responses"
  ADD COLUMN "device" public.response_device NOT NULL DEFAULT 'Desktop'::public.response_device;

ALTER TABLE "public"."responses"
  ADD COLUMN "submitted_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."survey_status" AS ENUM (
  'draft',
  'published',
  'closed'
);

ALTER TABLE "public"."surveys"
  ADD COLUMN "status" public.survey_status NOT NULL DEFAULT 'draft'::public.survey_status;

ALTER TABLE "public"."surveys"
  ADD COLUMN "category" text NOT NULL;

ALTER TABLE "public"."surveys"
  ADD COLUMN "accent" text NOT NULL DEFAULT '#0d5947'::text;

ALTER TABLE "public"."surveys"
  ADD COLUMN "show_progress" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."surveys"
  ADD COLUMN "collect_email" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."surveys"
  ADD COLUMN "thank_you_title" text NOT NULL DEFAULT ''::text;

ALTER TABLE "public"."surveys"
  ADD COLUMN "thank_you_message" text NOT NULL DEFAULT ''::text;

ALTER TABLE "public"."surveys"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."surveys"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."surveys"
  ADD COLUMN "published_at" timestamp WITH time zone;

ALTER TABLE "public"."surveys"
  ADD COLUMN "closed_at" timestamp WITH time zone;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."activity_events"
  ADD CONSTRAINT "activity_events_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."question_options"
  ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

ALTER TABLE "public"."questions"
  ADD CONSTRAINT "questions_survey_id_position_key" UNIQUE (survey_id, "position");

ALTER TABLE "public"."response_answers"
  ADD CONSTRAINT "response_answers_option_id_fkey" FOREIGN KEY (option_id) REFERENCES public.question_options(id) ON DELETE SET NULL;

ALTER TABLE "public"."response_answers"
  ADD CONSTRAINT "response_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

ALTER TABLE "public"."response_answers"
  ADD CONSTRAINT "response_answers_response_id_fkey" FOREIGN KEY (response_id) REFERENCES public.responses(id) ON DELETE CASCADE;

ALTER TABLE "public"."surveys"
  ADD CONSTRAINT "surveys_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."activity_events"
  ADD CONSTRAINT "activity_events_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE SET NULL;

ALTER TABLE "public"."questions"
  ADD CONSTRAINT "questions_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

ALTER TABLE "public"."responses"
  ADD CONSTRAINT "responses_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."response_answers_id_seq" TO "anon", "authenticated";

REVOKE ALL ON SEQUENCE "public"."response_answers_id_seq" FROM "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."response_answers_id_seq" TO "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."response_answers_id_seq" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activity_events" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."activity_events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activity_events" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activity_events" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."question_options" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."question_options" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."question_options" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."question_options" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."questions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."questions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."questions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."questions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."response_answers" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."response_answers" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."response_answers" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."response_answers" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."responses" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."responses" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."responses" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."responses" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."surveys" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."surveys" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."surveys" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."surveys" TO "service_role";

