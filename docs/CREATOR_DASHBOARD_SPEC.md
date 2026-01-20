# Ryl Creator Dashboard — Master Specification

> **Purpose**: This document is the single source of truth for building the Ryl Creator Dashboard. Every design decision, feature priority, and UI element must align with this specification.

---

## Core Identity

**This is NOT a dashboard. This is a Creator Business Operating System.**

Ryl creators made a combined **€3,192,000 profit last year** — not through virality, but through repeatable, optimizable commerce actions.

---

## The Three Questions

The dashboard must answer these questions, in this exact order:

| Priority | Question | UI Response |
|----------|----------|-------------|
| 1 | Am I making money? | Large, prominent revenue number |
| 2 | Why (or why not)? | Contextual breakdown by series/product |
| 3 | What should I do next? | Single highest-impact action recommendation |

**If a metric doesn't help answer one of these questions, it must NOT exist.**

---

## What This Dashboard Is NOT

- ❌ Analytics platform
- ❌ Onboarding wizard
- ❌ Tutorial checklist
- ❌ Vanity metrics screen
- ❌ Social media dashboard
- ❌ Marketing analytics tool

## What This Dashboard IS

- ✅ Business command center
- ✅ Profit optimization tool
- ✅ Action recommendation engine
- ✅ Commerce intelligence system

---

## Language Rules

### Use (Business Language)
- Revenue, Sales, Profit
- Conversion, Orders, Basket
- Performance, ROI, Margin

### Never Use (Social Language)
- Views, Followers, Likes
- Engagement, Reach, Impressions
- Viral, Trending, Algorithm

---

## Number Hierarchy

Numbers must be **hierarchical**, not flat. Show less by default, reveal depth on demand.

### Level 1 — Leadership Numbers (Always Visible)
Primary KPIs that answer "Am I making money?"

| Metric | Purpose |
|--------|---------|
| Total Revenue | The north star |
| Total Sales | Transaction volume |
| Avg Order Value | Basket optimization |
| Pending Payout | Cash flow visibility |

### Level 2 — Explanation Numbers (Contextual)
Secondary metrics that answer "Why?"

| Metric | Purpose |
|--------|---------|
| Revenue by Series | Content attribution |
| Revenue by Product | Product-market fit |
| Conversion Funnel | Hotspot → Click → Purchase |

### Level 3 — Optimization Numbers (Deep, On-Demand)
Advanced metrics for power users

| Metric | Purpose |
|--------|---------|
| Hotspot Timing | When in video converts best |
| Save → Purchase Rate | Wishlist conversion |
| Episode-to-Episode | Series retention |
| Purchase Time Patterns | When audience buys |

---

## Tab Structure

### 1. Revenue Tab (Primary)

**Purpose**: Answer "Am I making money?" immediately.

```
┌─────────────────────────────────────────────────┐
│ [Phase Hero - Setup/Early/Scale]                │
│ Contextual guidance based on business stage     │
├─────────────────────────────────────────────────┤
│ ████████  €X,XXX                               │
│ Total Revenue (prominent, calm)                 │
├─────────────────────────────────────────────────┤
│ Sales: XX    │    Avg Order: €XX    │    AOV   │
├─────────────────────────────────────────────────┤
│ Top Series (by revenue, not views)              │
│ ├── Series A ████████████ €XXX                 │
│ ├── Series B ████████ €XXX                     │
│ └── Series C ████ €XXX                         │
├─────────────────────────────────────────────────┤
│ Top Products (by revenue)                       │
│ ├── Product A — €XXX (XX sales)                │
│ └── Product B — €XXX (XX sales)                │
├─────────────────────────────────────────────────┤
│ Conversion Funnel                               │
│ Hotspot Clicks → Purchases → Revenue           │
└─────────────────────────────────────────────────┘
```

**Phase States**:
- **Setup** (0 sales): "Dein Business ist live" + Revenue Lever actions
- **Early** (1-4 sales): First sale celebration + "Keep going" guidance
- **Scale** (5+ sales): Full metrics + optimization recommendations

### 2. Audience Tab

**Purpose**: Understand WHO buys and WHEN they buy.

**Critical Rule**: Audience insights are based on **buying behavior**, not demographics.

```
┌─────────────────────────────────────────────────┐
│ Insights Cards                                  │
│ "Fashion converts 3x better than Tech"          │
│ "Peak purchases: 19:00-22:00"                   │
│ "Weekend buyers spend 40% more"                 │
├─────────────────────────────────────────────────┤
│ Category Performance                            │
│ Fashion   ████████████████ 68%                 │
│ Lifestyle ████████ 24%                         │
│ Tech      ███ 8%                               │
├─────────────────────────────────────────────────┤
│ Purchase Time Heatmap                           │
│ Mo Di Mi Do Fr Sa So                           │
│ [Visual heatmap by hour/day]                   │
├─────────────────────────────────────────────────┤
│ Buyer Segments                                  │
│ Repeat Buyers: XX%    │    Premium Buyers: XX% │
└─────────────────────────────────────────────────┘
```

**Every insight must answer**: "What should I post or sell next?"

### 3. Episodes Tab

**Purpose**: Which content drives revenue?

```
┌─────────────────────────────────────────────────┐
│ Summary Stats                                   │
│ Episodes: XX  │  Avg Revenue: €XX  │  Avg CVR  │
├─────────────────────────────────────────────────┤
│ Performance Comparison                          │
│ Best Performer vs Worst Performer               │
│ [Revenue, Conversion, Clicks comparison]        │
├─────────────────────────────────────────────────┤
│ Hotspot Timing Analysis                         │
│ Early (0-33%) ████████ 12% CVR                 │
│ Mid (33-66%)  ██████ 8% CVR                    │
│ Late (66%+)   ████ 5% CVR                      │
│ → "Place hotspots in first 20 seconds"          │
├─────────────────────────────────────────────────┤
│ Episode List (by revenue, not views)            │
│ [Thumbnail] Title — €XXX — X% conversion       │
└─────────────────────────────────────────────────┘
```

### 4. Products Tab

**Purpose**: Which products convert best?

```
┌─────────────────────────────────────────────────┐
│ Summary Stats                                   │
│ Products: XX  │  With Sales: XX  │  Avg CVR    │
├─────────────────────────────────────────────────┤
│ Champions                                       │
│ 💰 Highest Revenue: Product A — €XXX           │
│ 🎯 Best Conversion: Product B — 15%            │
│ 👆 Most Clicked: Product C — XXX clicks        │
├─────────────────────────────────────────────────┤
│ Save → Purchase Funnel                          │
│ Saved: XXX → Purchased: XX → Rate: XX%         │
│ "Avg X days between save and purchase"          │
├─────────────────────────────────────────────────┤
│ Product List (by revenue)                       │
│ [Image] Name — €XXX — X clicks — X saves       │
└─────────────────────────────────────────────────┘
```

---

## Visual Design Principles

### Hierarchy
- Big numbers > Small numbers > Charts
- One focal point per section
- Progressive disclosure (click to expand)

### Aesthetic
- Dark, premium, calm
- Gold accents for business metrics (`text-gold`, `border-gold/20`)
- Minimal UI chrome
- Generous whitespace

### Typography
- Revenue numbers: Bold, large (2xl-4xl)
- Labels: Muted, small
- Actions: Clear, prominent

### Layout
- One primary screen per tab
- Minimal scrolling
- Mobile-first (Gen Z behavior)
- Touch-friendly tap targets

---

## Action Recommendations Engine

The dashboard must always surface the **single highest-impact action**.

### Setup Phase Actions
| Action | Why |
|--------|-----|
| "Neue Episode posten" | More purchase moments |
| "Bestseller erneut platzieren" | Repetition sells |
| "Hotspot früher im Video" | First 20s convert best |

### Early Phase Actions
| Action | Why |
|--------|-----|
| "Erstelle eine Serie" | Series retain better |
| "Füge Produkte zu Episode X hinzu" | Untapped inventory |
| "Poste zur Peak-Zeit" | When audience buys |

### Scale Phase Actions
| Action | Why |
|--------|-----|
| "Repliziere Top-Performer" | Double down on winners |
| "Teste neue Kategorie" | Diversification |
| "Optimiere Hotspot-Timing" | Conversion gains |

---

## Empty States Philosophy

Empty states are NOT errors. They are opportunities.

**Never show**:
- "No data available"
- Greyed-out charts
- Disabled sections

**Always show**:
- Motivational guidance
- What data WILL appear
- How to unlock it through action

Example:
```
┌─────────────────────────────────────────────────┐
│ 📊 Audience Insights                            │
│                                                 │
│ Sobald du Verkäufe hast, zeigen wir dir:       │
│ • Wann deine Audience kauft                     │
│ • Welche Kategorien am besten konvertieren      │
│ • Wie sich Käufer verhalten                     │
│                                                 │
│ [Post your first shoppable episode →]           │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

### Data Sources
- `purchase_intents` + `purchase_items` → Revenue, Sales
- `analytics_events` → Hotspot clicks, views
- `shopable_products` → Product performance
- `episodes` + `series` → Content attribution

### Time Ranges
- Default: Last 30 days
- Options: 7 days, 30 days, 90 days, All time
- Always show comparison to previous period

### Performance
- Aggregate on backend when possible
- Lazy load Level 3 metrics
- Cache aggressively

---

## Success Criteria

The dashboard succeeds when:

1. **Clarity**: Creator knows their revenue in <2 seconds
2. **Attribution**: Creator knows WHY they made money
3. **Action**: Creator knows WHAT to do next
4. **Calm**: Dashboard feels premium, not overwhelming
5. **Trust**: Numbers are accurate and defensible

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|---------------|
| Show views as primary metric | Show revenue as primary metric |
| Display raw data tables | Show curated insights |
| Use pie charts | Use horizontal bars |
| Show 10+ metrics at once | Show 3-4 with drill-down |
| Use engagement language | Use business language |
| Hide tabs when no data | Show guidance in empty states |
| Celebrate views/follows | Celebrate sales/revenue |

---

## Final Mandate

> Build a dashboard that makes creators feel like CEOs of their own business.
> 
> Not influencers checking likes.
> Not marketers analyzing funnels.
> Not creators hoping for virality.
> 
> **Business owners making money.**

---

*Last updated: January 2026*
*Version: 1.0*
