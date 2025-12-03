import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Méthode non autorisée. Utilisez POST.' 
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { icsUrl } = await req.json()

    // Validate URL presence
    if (!icsUrl || typeof icsUrl !== 'string' || !icsUrl.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'L\'URL du calendrier .ics est requise.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Normalize URL: convert webcal:// to https://
    let normalizedUrl = icsUrl.trim()
    if (normalizedUrl.startsWith('webcal://')) {
      normalizedUrl = normalizedUrl.replace('webcal://', 'https://')
    }

    // Validate URL format
    let url: URL
    try {
      url = new URL(normalizedUrl)
      
      // Only allow https:// and http:// protocols
      if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return new Response(
        JSON.stringify({ 
          error: 'L\'URL fournie n\'est pas valide. Vérifiez qu\'elle commence par https:// ou webcal://.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Fetching .ics file from: ${normalizedUrl}`)

    // Fetch the .ics file from the remote server
    const icsResponse = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'TimeTracker-ICS-Importer/1.0',
        'Accept': 'text/calendar,text/plain,*/*',
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30000),
    })

    // Log response details for debugging
    console.log(`Response status: ${icsResponse.status}`)
    console.log(`Response content-type: ${icsResponse.headers.get('content-type')}`)

    // Check if fetch was successful
    if (!icsResponse.ok) {
      let errorMessage = 'Impossible de récupérer ce calendrier. '
      
      if (icsResponse.status === 404) {
        errorMessage += 'Le lien n\'existe pas ou n\'est plus accessible.'
      } else if (icsResponse.status === 401 || icsResponse.status === 403) {
        errorMessage += 'Ce calendrier nécessite une authentification. Veuillez vérifier qu\'il est accessible publiquement.'
      } else if (icsResponse.status >= 500) {
        errorMessage += 'Le serveur du calendrier rencontre des problèmes. Réessayez plus tard.'
      } else {
        errorMessage += `Code d'erreur: ${icsResponse.status}. Vérifiez que le lien .ics est correct et accessible.`
      }

      console.error(`Failed to fetch .ics: ${icsResponse.status} ${icsResponse.statusText}`)

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the content
    const rawIcs = await icsResponse.text()

    // Basic validation to check if content looks like an .ics file
    if (!rawIcs.includes('BEGIN:VCALENDAR') || !rawIcs.includes('END:VCALENDAR')) {
      console.error('Content does not appear to be a valid .ics file')
      console.error(`Content preview: ${rawIcs.substring(0, 200)}`)
      
      return new Response(
        JSON.stringify({ 
          error: 'Le contenu récupéré ne semble pas être un fichier calendrier valide. Vérifiez que le lien pointe vers un fichier .ics.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Successfully fetched .ics file (${rawIcs.length} bytes)`)

    // Return the raw .ics content
    return new Response(
      JSON.stringify({ 
        rawIcs,
        success: true 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in import-ics function:', error)

    let errorMessage = 'Une erreur est survenue lors de la récupération du calendrier.'
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = 'Le délai d\'attente a été dépassé. Le serveur du calendrier met trop de temps à répondre.'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.'
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})