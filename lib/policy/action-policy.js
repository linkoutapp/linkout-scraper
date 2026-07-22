const LinkoutError = require("../errors/linkout-error");
const defaults = require("./defaults");
const { sanitizeLedgerEntry } = require("./ledger");
const { detectPageState: defaultDetectPageState } = require("../browser/detect-page-state");

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createMemoryLedger(initial = []) {
  const entries = [...initial];
  return {
    async append(entry) {
      entries.push(sanitizeLedgerEntry(entry));
    },
    async countSuccessful(operation, date) {
      return entries.filter(
        (entry) =>
          entry.operation === operation &&
          entry.localDate === date &&
          entry.outcome === "success"
      ).length;
    },
    async read() {
      return [...entries];
    },
  };
}

function createActionPolicy({
  config = defaults,
  ledger = createMemoryLedger(),
  clock = () => new Date(),
  detectState = defaultDetectPageState,
} = {}) {
  async function record({ now, operation, target, outcome, errorCode = "" }) {
    await ledger.append({
      timestamp: now.toISOString(),
      localDate: localDate(now),
      operation,
      target,
      outcome,
      errorCode,
    });
  }

  async function fail(code, message, context) {
    await record({ ...context, outcome: "rejected", errorCode: code });
    throw new LinkoutError(code, message, { operation: context.operation });
  }

  async function begin({ operation, target, confirm = false, page } = {}) {
    const now = clock();
    const context = { now, operation: String(operation || ""), target };
    const operationConfig = config.operations && config.operations[operation];

    if (!confirm) {
      return fail("CONFIRMATION_REQUIRED", "Explicit action confirmation is required", context);
    }
    if (!operationConfig || operationConfig.enabled !== true) {
      return fail("OPERATION_DISABLED", "This operation is disabled by local policy", context);
    }

    const hours = config.operatingHours || { start: 0, end: 24 };
    if (now.getHours() < hours.start || now.getHours() >= hours.end) {
      return fail(
        "OUTSIDE_OPERATING_HOURS",
        "The action is outside configured operating hours",
        context
      );
    }

    const date = localDate(now);
    const successes = await ledger.countSuccessful(operation, date);
    if (successes >= operationConfig.dailyLimit) {
      return fail("DAILY_LIMIT_REACHED", "The local daily action limit is reached", context);
    }

    if (page && typeof detectState === "function") {
      const state = await detectState(page);
      if (state && state.stop) {
        return fail("PAGE_STATE_STOP", `Action stopped: ${state.state}`, context);
      }
    }

    let finished = false;
    return {
      async complete() {
        if (finished) return;
        finished = true;
        await record({ ...context, outcome: "success" });
      },
      async reject(errorCode = "ACTION_NOT_COMPLETED") {
        if (finished) return;
        finished = true;
        await record({ ...context, outcome: "failed", errorCode });
      },
    };
  }

  return { begin, config, ledger };
}

module.exports = {
  createActionPolicy,
  createMemoryLedger,
  localDate,
};
