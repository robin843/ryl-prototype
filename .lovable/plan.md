
# ShopableEngine Rebuild: Von Zwei Systemen zu Einem Modularen Kern

## Zusammenfassung

Ryl hat bereits **80% der Shopable-Funktionalitaet** implementiert. Statt eines kompletten Rebuilds konsolidieren wir die bestehenden Komponenten zu einem wiederverwendbaren `<ShopableEngine />` und schliessen die fehlenden Luecken.

## Was bereits existiert (kein Rebuild noetig)

| Feature | Status | Wo |
|---------|--------|-----|
| HLS Video Player | Fertig | `FeedHLSPlayer`, `HLSVideoPlayer` |
| Hotspot Rendering (DOM-based) | Fertig | `RylHotspot`, `ShopableHotspot` |
| Normalized Coordinates (0-1 / 0-100) | Fertig | `position_x`, `position_y` in DB |
| Multiple Hotspots per Frame | Fertig | `episode_hotspots` Tabelle |
| Product Panel (In-Video Overlay) | Fertig | `ProductPanel` |
| Stripe Checkout (Payment Intent) | Fertig | `create-payment-intent` Edge Function |
| Stripe Webhook (Purchase Tracking) | Fertig | `stripe-webhook` Edge Function |
| Analytics Events | Fertig | `analytics_events` + `useTrackEvent` |
| Conversion Funnel Dashboard | Fertig | `ConversionFunnelTab` |
| Manifest-based External Hotspots | Fertig | `useShopableManifest` (ETag-cached) |
| Cloudflare Stream HLS/ABR | Fertig | Video Pipeline |

## Was fehlt und gebaut werden muss

### 1. Frame-Accurate Positioning (statt Time-Based)

**Problem**: Hotspots nutzen aktuell `start_time`/`end_time` (Sekunden). Fuer frame-genaue Positionierung brauchen wir Frame-Nummern.

**Loesung**: DB-Migration hinzufuegen:
- `start_frame` (INTEGER, nullable) und `end_frame` (INTEGER, nullable) zu `episode_hotspots`
- `fps` (NUMERIC, default 30) zu `episodes` Tabelle
- Frame-Berechnung: `currentFrame = Math.floor(currentTime * fps)`
- Rueckwaertskompatibel: wenn `start_frame` null, Fallback auf `start_time`

### 2. Animated Hotspot Movement (Keyframe Interpolation)

**Problem**: Hotspots sind aktuell statisch positioniert.

**Loesung**: 
- Neues JSONB-Feld `keyframes` auf `episode_hotspots`: `[{frame: 120, x: 0.3, y: 0.5}, {frame: 180, x: 0.6, y: 0.4}]`
- `animation_type` Feld: `'static' | 'linear' | 'ease'`
- Interpolationsfunktion im Frontend die zwischen Keyframes linear/eased interpoliert

### 3. `<ShopableEngine />` Composite Component

**Problem**: Hotspot-Logik ist ueber `VideoPlayer`, `ShopableOverlay`, `FeedHLSPlayer` verteilt.

**Loesung**: Ein einziger wiederverwendbarer Wrapper:

```text
<ShopableEngine
  episodeId="..."
  videoRef={ref}
  wrapperRef={ref}
  mode="player" | "studio" | "embed"
>
  {/* Rendert automatisch: */}
  {/* - Hotspot Overlay Layer */}
  {/* - Product Panel */}
  {/* - Checkout Modal */}
  {/* - Analytics Tracking */}
</ShopableEngine>
```

Neue Dateien:
- `src/components/shopable/ShopableEngine.tsx` - Hauptkomponente
- `src/components/shopable/useFrameSync.ts` - Frame-accurate time sync
- `src/components/shopable/useHotspotInterpolation.ts` - Keyframe animation
- `src/components/shopable/ShopableContext.tsx` - Shared state (selected hotspot, panel open, etc.)

### 4. A/B Test Engine fuer Hotspot-Positionierung

**Problem**: Kein A/B Testing.

**Loesung**:
- `hotspot_variants` Tabelle: `id, hotspot_id, variant_name, position_x, position_y, weight`
- Edge Function `assign-hotspot-variant`: deterministic user assignment via hash
- Analytics Events enthalten `variant_id` im metadata JSONB
- Dashboard-Tab zeigt Variant-Performance (CTR, Conversion)

### 5. Mock-Mode entfernen / Checkout aktivieren

**Problem**: `ProductPanel` hat `MOCK_MODE = true` hardcoded.

**Loesung**: Mock-Flag durch Feature-Check ersetzen: Wenn Producer `stripeStatus === 'active'`, echten Checkout nutzen.

## Technische Architektur

```text
+------------------------------------------+
|           <ShopableEngine />             |
|                                          |
|  +-- useFrameSync(videoRef, fps) -----+ |
|  |   currentFrame, currentTime        | |
|  +------------------------------------+ |
|                                          |
|  +-- useHotspotInterpolation() -------+ |
|  |   activeHotspots with interpolated | |
|  |   x,y positions per frame          | |
|  +------------------------------------+ |
|                                          |
|  +-- ShopableOverlayLayer ------------+ |
|  |   Renders <RylHotspot /> for each  | |
|  |   active hotspot at correct pos    | |
|  +------------------------------------+ |
|                                          |
|  +-- ProductPanel + CheckoutModal ----+ |
|  |   Opens on hotspot click           | |
|  |   Stripe PaymentIntent in-video    | |
|  +------------------------------------+ |
|                                          |
|  +-- useTrackEvent (Analytics) -------+ |
|  |   Impressions, clicks, purchases   | |
|  +------------------------------------+ |
+------------------------------------------+
```

## Implementierungsschritte

### Phase 1: Database Schema Erweiterung
1. Migration: `fps` Feld zu `episodes`
2. Migration: `start_frame`, `end_frame`, `keyframes`, `animation_type`, `width`, `height` zu `episode_hotspots`
3. Migration: `hotspot_variants` Tabelle mit RLS
4. Bestehende Daten bleiben kompatibel (neue Felder sind nullable)

### Phase 2: Core Engine Hooks
5. `useFrameSync.ts` - synchronisiert `videoRef.currentTime` zu Frame-Nummer
6. `useHotspotInterpolation.ts` - berechnet interpolierte Positionen pro Frame
7. `ShopableContext.tsx` - React Context fuer Engine State

### Phase 3: ShopableEngine Component
8. `ShopableEngine.tsx` - composable Wrapper
9. Refactor `VideoPlayer.tsx` und `ShopableOverlay.tsx` um `<ShopableEngine />` zu nutzen
10. Refactor `Feed.tsx` / `SeriesFeed.tsx` um `<ShopableEngine />` zu integrieren

### Phase 4: Mock-Mode Cleanup + A/B Testing
11. Mock-Mode Flag in `ProductPanel` durch dynamischen Producer-Status-Check ersetzen
12. `assign-hotspot-variant` Edge Function
13. A/B Variant Tab im Studio Analytics Dashboard

### Phase 5: White-Label Export Vorbereitung
14. `ShopableEngine` als eigenstaendiges Package-Interface mit Props-API dokumentieren
15. Embed-Mode (minimale UI, keine Ryl-Branding Elemente)

## Wichtige Hinweise

- **Kein Next.js**: Ryl nutzt React + Vite. SSR ist nicht noetig.
- **Kein AWS/DynamoDB**: Alles laeuft ueber Lovable Cloud (Supabase). Cloudflare Stream bleibt fuer Video-Delivery.
- **Kein Canvas-Overlay**: DOM-based Hotspots mit CSS `position: absolute` + `transform` sind performanter und accessibility-freundlicher als Canvas. Bei 200+ Hotspots kann spaeter auf Canvas gewechselt werden.
- **Stripe ist bereits integriert**: PaymentIntent + Webhook + Connect sind produktionsreif.
- **60fps**: `requestAnimationFrame`-basierter Frame Sync statt `timeupdate` Events (die nur ~4fps feuern).

## Was NICHT gebaut wird (nicht validiert)

- Eigene Video-Hosting Infrastruktur (Cloudflare Stream bleibt)
- DynamoDB Migration (Supabase ist ausreichend)
- NestJS Backend (Edge Functions decken alles ab)
- Full Canvas Renderer (DOM reicht fuer aktuelle Hotspot-Dichte)
