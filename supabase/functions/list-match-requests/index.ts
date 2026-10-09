import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ 
      success: false,
      error: "Method not allowed" 
    }), {
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  }

  try {
    // Debug: log whether Authorization header and env vars are present (mask token)
    const incomingAuth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (incomingAuth) {
      try {
        console.log("Incoming Authorization header (masked):", incomingAuth.slice(0, 32) + "...");
      } catch {}
    } else {
      console.log("No Authorization header found on request");
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
      return new Response(JSON.stringify({ success: false, error: 'Server misconfiguration: missing env vars' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: req.headers.get("Authorization") || '' } } }
    );

    // Get user ID from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      try {
        console.error("Authentication error:", JSON.stringify(userError, null, 2));
      } catch {
        console.error('Authentication error (non-serializable):', userError);
      }
      return new Response(JSON.stringify({ 
        success: false,
        error: "Unauthorized - please sign in again",
        details: userError?.message || null
      }), {
        status: 401,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }

    // Parse query params
    const url = new URL(req.url);
    const ticket_id = url.searchParams.get("ticket_id");

    if (!ticket_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "ticket_id parameter is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }

    console.log("Fetching match requests for ticket:", ticket_id, "by user:", user.id);

    // Verify that the user owns the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("user_id")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      try { console.error("Ticket not found:", JSON.stringify(ticketError, null, 2)); } catch { console.error('Ticket not found (non-serializable):', ticketError); }
      return new Response(JSON.stringify({ 
        success: false,
        error: "Ticket not found",
        details: ticketError?.message || null
      }), {
        status: 404,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }

    if (ticket.user_id !== user.id) {
      console.error("User does not own ticket:", user.id, "vs", ticket.user_id);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Forbidden - you can only view requests for your own tickets" 
      }), {
        status: 403,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }

    // Fetch pending match requests for this ticket
    const { data: requests, error } = await supabase
      .from("match_requests")
      .select(`
        id,
        requester_id,
        requester_display_name,
        requester_need_tags,
        status,
        created_at
      `)
      .eq("ticket_id", ticket_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      try { console.error("Database error:", JSON.stringify(error, null, 2)); } catch { console.error('Database error (non-serializable):', error); }
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to fetch match requests: ${error.message}`,
        details: error.details || null
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }

    console.log("Fetched match requests:", requests?.length || 0, "requests found");

    return new Response(JSON.stringify({ 
      success: true,
      requests: requests || [] 
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });

  } catch (error: any) {
    try { console.error("Unexpected error in list-match-requests function:", JSON.stringify(error, null, 2)); } catch { console.error('Unexpected error (non-serializable):', error); }
    return new Response(JSON.stringify({ 
      success: false,
      error: "Internal server error",
      message: error?.message || "Unknown error occurred",
      stack: (error && error.stack) ? error.stack : null
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  }
});