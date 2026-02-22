import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the page HTML
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RylBot/1.0; +https://ryl.app)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "fetch_failed", status: res.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();

    // Extract meta tags
    const meta = (name: string): string | null => {
      // Try og: first, then standard meta
      const ogMatch = html.match(
        new RegExp(
          `<meta[^>]+(?:property|name)=["']og:${name}["'][^>]+content=["']([^"']+)["']`,
          "i"
        )
      ) ?? html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:${name}["']`,
          "i"
        )
      );
      if (ogMatch) return ogMatch[1];

      const stdMatch = html.match(
        new RegExp(
          `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
          "i"
        )
      ) ?? html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
          "i"
        )
      );
      return stdMatch ? stdMatch[1] : null;
    };

    // Title: og:title > <title>
    const title =
      meta("title") ??
      (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null);

    // Description
    const description = meta("description");

    // Image
    const image = meta("image");

    // Price: og:price:amount or product:price:amount or JSON-LD
    let priceCents: number | null = null;
    let currency: string | null = null;

    const priceAmount =
      meta("price:amount") ??
      (() => {
        const m = html.match(
          /(?:property|name)=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i
        ) ?? html.match(
          /content=["']([^"']+)["'][^>]+(?:property|name)=["']product:price:amount["']/i
        );
        return m ? m[1] : null;
      })();

    if (priceAmount) {
      const parsed = parseFloat(priceAmount.replace(",", "."));
      if (!isNaN(parsed)) priceCents = Math.round(parsed * 100);
    }

    currency =
      meta("price:currency") ??
      (() => {
        const m = html.match(
          /(?:property|name)=["']product:price:currency["'][^>]+content=["']([^"']+)["']/i
        ) ?? html.match(
          /content=["']([^"']+)["'][^>]+(?:property|name)=["']product:price:currency["']/i
        );
        return m ? m[1] : null;
      })();

    // Try JSON-LD for price if not found
    if (priceCents === null) {
      const jsonLdMatch = html.match(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      if (jsonLdMatch) {
        for (const block of jsonLdMatch) {
          const jsonStr = block.replace(
            /<\/?script[^>]*>/gi,
            ""
          );
          try {
            const ld = JSON.parse(jsonStr);
            const offers = ld.offers ?? ld.Offers;
            if (offers) {
              const price = offers.price ?? offers.lowPrice;
              if (price) {
                priceCents = Math.round(parseFloat(String(price).replace(",", ".")) * 100);
                currency = currency ?? offers.priceCurrency ?? null;
              }
            }
          } catch {
            // skip invalid JSON-LD
          }
        }
      }
    }

    // Brand: og:brand or JSON-LD
    let brand: string | null = meta("brand") ?? meta("site_name");
    if (!brand) {
      try {
        const host = new URL(url).hostname.replace("www.", "");
        brand = host.split(".")[0];
        // Capitalize first letter
        brand = brand.charAt(0).toUpperCase() + brand.slice(1);
      } catch {
        // ignore
      }
    }

    return new Response(
      JSON.stringify({
        title,
        description,
        image,
        price_cents: priceCents,
        currency: currency?.toUpperCase() ?? "EUR",
        brand,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("scrape-product-meta error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
