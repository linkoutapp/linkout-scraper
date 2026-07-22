# Live Read-Only Selector Checks

Live checks are opt-in diagnostics for maintainers. They attach to visible local Chrome and must never type, click an action, send, invite, react, endorse, submit credentials, or change filters.

## Prerequisites

1. Use the configured macOS device and its normal network connection.
2. Start stable Chrome with port `9222` and a dedicated persistent `--user-data-dir` as documented in the README.
3. Sign in manually and open a regular LinkedIn tab.
4. Stop if LinkedIn displays login, checkpoint, CAPTCHA, automated-activity warning, restriction, or another unexpected modal.
5. Supply the specific profile and existing message thread only through local environment variables; do not commit them.

## Run

```sh
LINKOUT_LIVE_READ_ONLY=1 \
LINKOUT_LIVE_PROFILE_URL="https://www.linkedin.com/in/example/" \
LINKOUT_LIVE_THREAD_URL="https://www.linkedin.com/messaging/thread/example/" \
npm run test:live:read-only
```

The suite checks profile extraction, connection status, existing connection listing, direct thread history, and recent activity selectors. It redacts query strings and does not write page content, cookies, screenshots, or personal records to disk.

The live suite is excluded from CI. Passing it proves only that the checked selectors matched at that time; it does not guarantee future selector stability, policy compliance, or account safety.
