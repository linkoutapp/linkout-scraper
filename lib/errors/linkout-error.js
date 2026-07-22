class LinkoutError extends Error {
  constructor(code, message, details = {}, options = {}) {
    super(message, options);
    this.name = "LinkoutError";
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

module.exports = LinkoutError;
