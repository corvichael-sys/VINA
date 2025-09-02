import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, pin, avatar_url } = await req.json();

    if (!username || !pin) {
      return new Response(JSON.stringify({ error: 'Username and PIN are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use the Service Role Key for admin-level operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Check if username already exists
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('users_profile')
      .select('username')
      .eq('username', username)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Username is already taken' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409, // Conflict
      });
    }

    // 2. Hash the PIN
    const pin_hash = await hash(pin);

    // 3. Create a new user in auth.users
    // We use a dummy email and a strong random password because auth requires it,
    // but the user will only ever log in with their username and PIN.
    const dummyEmail = `${crypto.randomUUID()}@debt-tracker.local`;
    const randomPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: randomPassword,
      email_confirm: true, // Auto-confirm the dummy email
    });

    if (authError) {
      throw authError;
    }

    const newUserId = authData.user.id;

    // 4. Create the user profile with the hashed PIN
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .update({
        username: username,
        pin_hash: pin_hash,
        avatar_url: avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newUserId)
      .select()
      .single();
    
    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw profileError;
    }

    return new Response(JSON.stringify({ user: authData.user, profile: profileData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});