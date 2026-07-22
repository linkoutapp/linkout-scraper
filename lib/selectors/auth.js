module.exports = Object.freeze({
  login: Object.freeze({
    root: ['main', '[role="main"]'],
    username: ['input[name="session_key"]', '#username'],
    password: ['input[name="session_password"]', '#password'],
    submit: ['button[type="submit"]', 'form button[aria-label*="Sign in"]'],
    authenticated: [
      'input[placeholder*="Search"]',
      'a[href^="/feed/"]',
      '.search-global-typeahead__input',
    ],
  }),
  challenge: Object.freeze({
    root: [
      'main form[action*="checkpoint"]',
      '[role="main"] form[action*="checkpoint"]',
      '.input_verification_pin',
    ],
    code: [
      'input[name="pin"]',
      'input[autocomplete="one-time-code"]',
      '.input_verification_pin',
    ],
    submit: ['button[type="submit"]', 'button[aria-label*="Submit"]'],
  }),
});
