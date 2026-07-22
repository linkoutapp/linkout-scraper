const test = require("node:test");
const assert = require("node:assert/strict");

const send2FA = require("../../lib/linkedin/linkedin.send2FA");

test("2FA submission is replaced with manual sign-in", async () => {
  const page = {
    goto: async () => assert.fail("must not automate sign-in"),
    keyboard: { type: async () => assert.fail("must not type credentials") },
  };
  await assert.rejects(
    send2FA(page, null, { code: "123456" }),
    (error) => error.code === "MANUAL_2FA_REQUIRED"
  );
});
