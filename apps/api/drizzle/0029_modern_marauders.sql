ALTER TABLE "role_permission" ADD COLUMN "scope" jsonb;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "system" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN "updated_by" text;--> statement-breakpoint
-- Backfill: `listPermissions` only seeds an agency with zero rows, so existing
-- agencies never pick up new keys on their own. Give every stored role the
-- record scopes it now needs...
DO $$
DECLARE
  reach_by_role CONSTANT jsonb := '{"owner":"all","admin":"all","accountManager":"all","profileLead":"team","hiringManager":"team","recruiter":"own","sourcer":"own","client":"own"}';
  scoped CONSTANT text[] := ARRAY['jobs','candidates','submissions','interviews','clients','contacts','reports','revenue','commissions'];
  r record;
  res text;
  reach text;
  acc jsonb;
BEGIN
  FOR r IN SELECT id, role FROM role_permission WHERE scope IS NULL LOOP
    reach := COALESCE(reach_by_role ->> r.role, 'own');
    acc := '{}'::jsonb;
    FOREACH res IN ARRAY scoped LOOP
      acc := acc || jsonb_build_object(res, reach);
    END LOOP;
    UPDATE role_permission SET scope = acc WHERE id = r.id;
  END LOOP;
END $$;--> statement-breakpoint
-- ...and the `export` action the permission matrix now renders as a column.
DO $$
DECLARE
  export_grants CONSTANT jsonb := '{"owner":["*","reports","candidates","clients","contacts","revenue","commissions"],"admin":["reports","candidates","clients","contacts","revenue","commissions"],"profileLead":["candidates","commissions"],"accountManager":["reports","revenue","commissions"]}';
  r record;
  res text;
BEGIN
  FOR r IN SELECT id, role FROM role_permission LOOP
    IF export_grants ? r.role THEN
      FOR res IN SELECT jsonb_array_elements_text(export_grants -> r.role) LOOP
        UPDATE role_permission
           SET permissions = jsonb_set(permissions, ARRAY[res], (permissions -> res) || '["export"]'::jsonb)
         WHERE id = r.id
           AND permissions ? res
           AND NOT (permissions -> res @> '["export"]'::jsonb);
      END LOOP;
    END IF;
  END LOOP;
END $$;
