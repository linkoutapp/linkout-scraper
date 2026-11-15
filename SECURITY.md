# Security

Report suspected security issues privately to saiadarshsivakumar@gmail.com. Do not include passwords, session cookies, or browser profiles in public issues.

If a credential was ever committed, rotate or revoke it anywhere it was used or reused, and invalidate relevant sessions. Removing a current file or rewriting branches does not invalidate the credential. After cleanup, repository owners should ask GitHub Support to remove cached or dangling sensitive objects. Verify the response without sharing the credential itself.

The runtime uses an existing local browser session. Keep Chrome DevTools on loopback. Daily limits and confirmation checks do not guarantee account safety or compliance with LinkedIn rules.


## Action budget and persistent state

Only the boolean `confirm: true` authorizes an action. A daily limit counts admitted attempts, including pending or failed work, because a browser failure can happen after the action was sent. Admission reserves a slot atomically. Success records with an action ID do not consume a second slot; older success records still count.

Reuse one policy for related calls. For limits shared across processes or restarts, inject a persistent ledger from `linkout-scraper/lib/policy/ledger`:

```js
const { createLedger } = require("linkout-scraper/lib/policy/ledger");
const actionPolicy = Linkout.tools.createActionPolicy({
  config, // Your explicit operation limits and operating hours.
  ledger: createLedger({ stateDirectory: "/absolute/private/path/linkout-state" }),
});
```

All processes controlling the same account must use the same state directory and local timezone. Custom ledgers must implement atomic `reserve(entry, limit)`. `countSuccessful` remains a reporting method; it does not determine admission.

A busy or stale `.lock` file stops admission with `LEDGER_BUSY`. There is no automatic stale-lock takeover. After a crash, stop every writer, preserve the ledger, then remove only its `.lock` file before restarting. Never delete the ledger to recover a lock.
