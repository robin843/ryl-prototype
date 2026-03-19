import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[generate-episode-description] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      seriesTitle,
      seriesGenre,
      episodeNumber,
      totalEpisodes,
      startTime,
      endTime,
      videoDuration,
    } = await req.json();

    logStep("Generating description", { seriesTitle, episodeNumber, startTime, endTime });

    const durationMinutes = Math.round((endTime - startTime) / 60 * 10) / 10;
    const positionPercent = Math.round((startTime / videoDuration) * 100);

    const systemPrompt = `Du bist ein kreativer Content-Editor für eine Video-Streaming-Plattform. 
Du schreibst kurze, ansprechende Episoden-Beschreibungen auf Deutsch.

WICHTIGE REGELN:
- Maximal 2 Sätze
- Beschreibe was in diesem Abschnitt des Videos passieren KÖNNTE basierend auf der Position
- Sei nicht zu spezifisch wenn du unsicher bist - lieber allgemein aber stimmungsvoll
- Nutze das Genre und den Serientitel als Kontext
- Kein Clickbait, keine erfundenen Details
- Schreibe im Präsens`;

    const userPrompt = `Serie: "${seriesTitle}"
Genre: ${seriesGenre || "Nicht angegeben"}
Episode ${episodeNumber} von ${totalEpisodes}
Zeitbereich: ${formatTime(startTime)} – ${formatTime(endTime)} (${durationMinutes} Min.)
Position im Video: ${positionPercent}% (${positionPercent < 15 ? "Anfang" : positionPercent > 85 ? "Ende/Finale" : positionPercent > 60 ? "Zweite Hälfte" : "Erste Hälfte"})

Schreibe eine kurze Episoden-Beschreibung (1-2 Sätze).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit überschritten. Bitte versuche es gleich nochmal." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-Credits aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "";

    logStep("Generated description", { episodeNumber, descriptionLength: description.length });

    return new Response(
      JSON.stringify({ description }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
