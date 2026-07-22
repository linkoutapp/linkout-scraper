---
name: linkedin-read
description: Use when a user asks to inspect a LinkedIn profile, relationship status, existing connections, message history, posts, reactions, or comments through their signed-in desktop browser.
---

# LinkedIn Read

Use Linkout only for bounded, read-only inspection through the user's visible local Chrome session.

## Before reading

1. Require visible local Chrome on the configured macOS device and confirm it is already signed in to LinkedIn.
2. Require an explicit LinkedIn URL for profile, thread, or activity-specific requests.
3. Collect the minimum data needed for the request. Do not broaden a request into bulk collection.
4. Explain when relevant that local execution does not guarantee account safety or compliance.

## Choose a tool

- Profile identity: `linkedin_get_profile`
- Relationship status: `linkedin_get_connection_status`
- Existing connections: `linkedin_list_connections`
- Existing thread history: `linkedin_read_message_thread`
- Recent posts: `linkedin_list_posts`
- Recent reactions: `linkedin_list_reactions`
- Recent comments: `linkedin_list_comments`
- One activity item and comments: `linkedin_list_posts_with_comments`

Use the smallest practical `count`. Return the tool result without exposing internal selectors, Chrome debugging details, or unrelated personal data.

## Stop conditions

Stop immediately and report the state when the tool encounters login, checkpoint, CAPTCHA, automation warning, restriction, session expiry, selector ambiguity, or another unexpected modal. Do not retry around, solve, dismiss, or conceal a LinkedIn security control.

## Boundaries

This skill is read-only. Never type, send a message, connect, invite, like, endorse, submit login credentials or 2FA, change Sales Navigator filters, spoof a fingerprint, or claim that Linkout is undetectable. Ask the user to perform authentication manually in visible Chrome.
