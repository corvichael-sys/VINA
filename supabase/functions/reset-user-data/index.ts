/// <reference lib="deno.ns" />
/// <reference types="https://deno.land/std@0.190.0/http/server.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => { // Fix 3: Explicitly type 'req'
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the user that called the function.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', // Fix 4, 5: Deno global should be recognized with reference lib
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the auth session.
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        })
    }

    // Create a service role client to bypass RLS for deletion.
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '', // Fix 6, 7: Deno global should be recognized
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userId = user.id;

    // Deletion order is important to respect foreign key constraints.
    // We delete items that depend on others first.
    const tablesToDeleteFrom = [
        'transactions',
        'payment_plan_debts',
        'plan_items',
        'payment_plans',
        'debts',
        'budgets',
        'paychecks'
    ];

    for (const table of tablesToDeleteFrom) {
        const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
        if (error) {
            console.error(`Error deleting from ${table} for user ${userId}:`, error);
            throw new Error(`Failed to delete data from ${table}: ${error.message}`);
        }
    }

    return new Response(JSON.stringify({ message: 'All user data has been deleted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) { // Explicitly type error as unknown
    // Fix 8: Type assertion for 'error'
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})