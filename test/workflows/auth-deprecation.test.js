const test = require("node:test");
const assert = require("node:assert/strict");

const login = require("../../lib/linkedin/linkedin.login.service");
const loginWithEmail = require("../../lib/linkedin/linkedin.login.with.email.service");
const send2FA = require("../../lib/linkedin/linkedin.send2FA");

test("cookie login is replaced with visible Chrome migration guidance", async () => {
  const page = { setCookie: async () => assert.fail("must not inject cookies") };
  await assert.rejects(login(page, null, { cookie: "secret" }), (error) => {
    assert.equal(error.code, "MANUAL_LOGIN_REQUIRED");
    assert.match(error.message, /visible.*Chrome/i);
    assert.equal(JSON.stringify(error).includes("secret"), false);
    return true;
  });
});

test("email/password and 2FA submission are replaced with manual sign-in", async () => {
  const page = {
    goto: async () => assert.fail("must not automate sign-in"),
    keyboard: { type: async () => assert.fail("must not type credentials") },
  };
  await assert.rejects(
    loginWithEmail(page, null, { user: "u", password: "p" }),
    (error) => error.code === "MANUAL_LOGIN_REQUIRED"
  );
  await assert.rejects(
    send2FA(page, null, { code: "123456" }),
    (error) => error.code === "MANUAL_2FA_REQUIRED"
  );
});
