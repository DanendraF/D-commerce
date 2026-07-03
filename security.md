# SECURITY.md

## D'Commerce Web Application Security Rules

This document outlines the security rules tailored for the Next.js, Supabase, and Odoo architecture used in this project.

### General Principles
- **Never trust user input.**
- Validate every input on the server before passing it to Odoo or Supabase.
- Sanitize output before rendering in React.
- Follow the Principle of Least Privilege.
- Fail securely (do not expose stack traces to the frontend).
- Keep npm dependencies updated.
- Use HTTPS everywhere.
- Never expose server secrets (e.g., Midtrans Server Key) to the client.
- Security is enabled by default.

---

### Authentication (Supabase)
- All authentication is managed via **Supabase Auth**.
- Use Secure, HttpOnly, SameSite cookies for session management (handled via Supabase SSR).
- Never store plaintext passwords; rely on Supabase's built-in secure hashing.
- Destroy sessions completely on logout using `supabase.auth.signOut()`.

---

### Authorization
- Verify authorization on every API Route request.
- Never trust frontend state (e.g., Zustand store) for critical authorization.
- Enforce Row Level Security (RLS) policies in Supabase.
- Prevent IDOR (Insecure Direct Object Reference) by always verifying `user.id` matches the requested resource.

---

### Input Validation
**Validate before sending to APIs:**
- Type
- Length
- Format
- Whitelist values

**Reject:**
- Unexpected fields
- Malformed JSON

---

### XSS Prevention
- Rely on React's automatic escaping for DOM rendering.
- Encode: HTML, Attribute, JavaScript, URL when manually manipulating DOM.
- Enable `Content-Security-Policy`.
- **Never** use `dangerouslySetInnerHTML` unless strictly necessary and sanitized (e.g., using DOMPurify).

---

### CSRF Protection
- Next.js Server Actions and API routes must validate origins.
- Use SameSite Cookies for Supabase Auth.
- **Protect:** `POST`, `PUT`, `PATCH`, `DELETE` methods.

---

### API Security (Next.js Routes)
**Require:**
- User Authentication (verify session)
- Authorization (verify ownership)
- Rate limiting (for checkout and webhooks)
- Input validation

**Rules:**
- **Never expose:** Stack traces, Internal Odoo IDs (unless necessary), Server-side Keys.

---

### Headers
**Always enable (via next.config.js):**
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`

---

### Logging & Error Handling
**Log:**
- Midtrans Webhook events
- Odoo synchronization failures
- Unexpected exceptions

**Error Handling:**
- Return generic messages to the client.
- **Never expose:** Stack traces, Framework version, Server information in API responses.

---

### Secrets
**Store in:**
- `.env` (Local)
- Vercel/Hosting Environment Variables (Production)

**Never commit:**
- `.env`
- Midtrans Server Key
- Odoo XML-RPC Password
- Supabase Service Role Key

---

### Production
**Disable:**
- Debug mode
- Verbose errors
- Development endpoints

---

### Things Never Allowed
- ❌ Hardcoded secrets
- ❌ Passing Midtrans Server Key to the frontend
- ❌ Modifying database records from the frontend without API validation
- ❌ Trusting client validation
- ❌ Exposed `.env`
- ❌ Missing HTTPS

---

### Before Every Release
- [ ] All tests pass
- [ ] Environment variables configured in hosting
- [ ] HTTPS enabled
- [ ] Webhook URLs pointing to production
- [ ] Error pages verified