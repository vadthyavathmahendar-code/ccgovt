-- Enable Supabase Realtime for workflow tables
begin;
  -- Create publication if not exists
  do $$
  begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      create publication supabase_realtime;
    end if;
  end;
  $$;

  -- Add tables to publication
  alter publication supabase_realtime add table public.complaints;
  alter publication supabase_realtime add table public.broadcasts;
commit;
