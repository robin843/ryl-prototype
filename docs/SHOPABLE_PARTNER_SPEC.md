# Shopable Partner Integration Specification

**Version:** 1.0  
**Last Updated:** 2026-02-02  
**Status:** Production

---

## Overview

This document specifies the JWT-based SSO deeplink integration between Ryl (upstream) and Shopable Studio (downstream).

Ryl generates a signed JWT and redirects producers to Shopable Studio for hotspot editing. Shopable is responsible for validating the token, provisioning users, and loading the correct video.

---

## 1. JWT Contract

### Token Format
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload Claims
| Claim | Type | Required | Description |
|-------|------|----------|-------------|
| `sub` | string (UUID) | ✅ | Ryl user ID |
| `email` | string | ✅ | Producer's email address |
| `role` | string | ✅ | Always `"producer"` |
| `source` | string | ✅ | Always `"ryl"` |
| `video_id` | string | ✅ | Cloudflare Stream UID or asset ID |
| `video_url` | string | ⚠️ | HLS manifest URL (may be null for legacy videos) |
| `external_id` | string | ✅ | Ryl episode UUID |
| `iat` | number | ✅ | Issued at (Unix timestamp) |
| `exp` | number | ✅ | Expiry (Unix timestamp, +5 minutes) |

### Example Payload
```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "producer@example.com",
  "role": "producer",
  "source": "ryl",
  "video_id": "cf_stream_uid_here",
  "video_url": "https://customer-abc.cloudflarestream.com/video_id/manifest/video.m3u8",
  "external_id": "episode-uuid-here",
  "iat": 1710000000,
  "exp": 1710000300
}
```

---

## 2. Deeplink Format

### URL Structure
```
https://shopable-spotlight.lovable.app/?token={JWT}&source=ryl&video_id={video_id}&external_id={episode_id}&video_url={hls_url}
```

### Query Parameters
| Parameter | Required | Description |
|-----------|----------|-------------|
| `token` | ✅ | The signed JWT |
| `source` | ✅ | Always `"ryl"` |
| `video_id` | ✅ | Same as JWT claim (for convenience) |
| `external_id` | ✅ | Same as JWT claim (for convenience) |
| `video_url` | ⚠️ | HLS manifest URL (if available) |

**Note:** Query parameters duplicate JWT claims for backward compatibility. The JWT is the authoritative source.

---

## 3. Validation Requirements (Shopable's Responsibility)

### CRITICAL Security Checks

1. **Algorithm Validation**
   ```
   ❌ REJECT if alg !== "HS256"
   ❌ REJECT if alg === "none"
   ```

2. **Signature Verification**
   - Use shared secret: `SHOPABLE_JWT_SECRET`
   - Verify using HMAC-SHA256

3. **Expiry Check**
   ```
   ❌ REJECT if exp < now()
   ```

4. **Source Validation**
   ```
   ❌ REJECT if source !== "ryl"
   ```

5. **Role Validation**
   ```
   ❌ REJECT if role !== "producer"
   ```

### Validation Pseudocode
```typescript
function validateRylToken(token: string, secret: string): TokenPayload | null {
  // 1. Split token
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  
  // 2. Decode header
  const header = JSON.parse(base64Decode(headerB64));
  
  // 3. CRITICAL: Reject non-HS256 algorithms
  if (header.alg !== 'HS256') {
    throw new Error('Invalid algorithm');
  }
  
  // 4. Verify signature
  const expectedSignature = hmacSha256(`${headerB64}.${payloadB64}`, secret);
  if (!timingSafeEqual(signatureB64, base64UrlEncode(expectedSignature))) {
    throw new Error('Invalid signature');
  }
  
  // 5. Decode and validate payload
  const payload = JSON.parse(base64Decode(payloadB64));
  
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  if (payload.source !== 'ryl') {
    throw new Error('Invalid source');
  }
  
  if (payload.role !== 'producer') {
    throw new Error('Invalid role');
  }
  
  return payload;
}
```

---

## 4. User Provisioning (Shopable's Responsibility)

### Flow
1. Lookup user by `email`
2. If exists → use existing user
3. If not exists → create new user with:
   - Email: `payload.email`
   - Auto-confirm: `true`
   - Metadata:
     ```json
     {
       "source": "ryl",
       "role": "producer",
       "ryl_user_id": "<payload.sub>"
     }
     ```

### Idempotency Requirements
- Use database-level UNIQUE constraint on email
- Handle race conditions with `ON CONFLICT DO NOTHING`
- Never create duplicate users

---

## 5. Video Resolution (Shopable's Responsibility)

### Mapping
Videos are mapped using a composite key:
```
(partner_id, external_id) → shopable_video_id
```

Where:
- `partner_id` = `"ryl.zone"` (constant)
- `external_id` = `payload.video_id`

### Flow
1. Query: `SELECT id FROM videos WHERE partner_id = 'ryl.zone' AND external_id = ?`
2. If exists → use existing video
3. If not exists → create new video with:
   - `partner_id`: `"ryl.zone"`
   - `external_id`: `payload.video_id`
   - `hls_url`: `payload.video_url`

### Idempotency Requirements
- Use UNIQUE constraint on `(partner_id, external_id)`
- Handle race conditions with `ON CONFLICT DO NOTHING` + re-select
- Never create duplicate video entries

---

## 6. Session Establishment (Shopable's Responsibility)

### Requirements
- User must be fully authenticated after deeplink processing
- Session must survive page refresh
- No additional login steps required

### Recommended Approach
```typescript
// After validating token and resolving/creating user:
const { data, error } = await supabase.auth.admin.createUser({
  email: payload.email,
  email_confirm: true,
  user_metadata: {
    source: 'ryl',
    role: 'producer',
    ryl_user_id: payload.sub
  }
});

// Create session for user
const { data: session } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: payload.email,
  options: {
    redirectTo: `/editor/${resolvedVideoId}`
  }
});
```

---

## 7. Error Handling Requirements

### Error Response Format
All errors must return an HTML page (not JSON) with:
- Clear error message
- Retry suggestion if applicable
- No sensitive details exposed

### Error Cases
| Scenario | HTTP Status | User Message |
|----------|-------------|--------------|
| Missing token | 400 | "Ungültiger Link. Bitte versuche es erneut." |
| Invalid signature | 401 | "Authentifizierung fehlgeschlagen." |
| Expired token | 401 | "Link abgelaufen. Bitte neuen Link anfordern." |
| Invalid source | 403 | "Zugriff verweigert." |
| User creation failed | 500 | "Fehler beim Einrichten. Bitte versuche es erneut." |
| Video resolution failed | 500 | "Video konnte nicht geladen werden." |

---

## 8. Logging Requirements

All deeplink requests must be logged with:
- Timestamp
- Token validation result
- User ID (resolved or created)
- Video ID (resolved or created)
- Success/failure status
- Error details (if failed)

### Log Format
```json
{
  "timestamp": "2026-02-02T10:00:00Z",
  "event": "deeplink_processed",
  "source": "ryl",
  "email": "producer@example.com",
  "ryl_user_id": "...",
  "video_id": "...",
  "external_id": "...",
  "user_action": "existing|created",
  "video_action": "existing|created",
  "result": "success|failure",
  "error": null
}
```

---

## 9. Testing Checklist

Before going live, verify:

- [ ] Valid token → User authenticated, video loaded
- [ ] Same token clicked 10× → No duplicates, same result
- [ ] Expired token → Clean error page
- [ ] Invalid signature → 401 error
- [ ] Missing video_url → Video still resolvable by external_id
- [ ] Existing user → Reused, not duplicated
- [ ] Existing video → Reused, not duplicated
- [ ] Race condition (2 concurrent requests) → No duplicates
- [ ] Page refresh mid-auth → Session survives
- [ ] Network timeout → Clean error, no partial state

---

## 10. Contact

For integration support, contact the Ryl engineering team.
