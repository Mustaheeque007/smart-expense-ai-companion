// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fvchxixupkepvzyxdvbx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Y2h4aXh1cGtlcHZ6eXhkdmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTU4MDcsImV4cCI6MjA2NjM3MTgwN30.40NzmhQ_dW68OGgN6M3ahDtiNFDqanR3ZKjfyRR9cgY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);