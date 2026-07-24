module.exports = Object.freeze({
  operatingHours: Object.freeze({ start: 9, end: 18 }),
  operations: Object.freeze({
    connect: Object.freeze({ enabled: false, dailyLimit: 10 }),
    message: Object.freeze({ enabled: false, dailyLimit: 20 }),
    like: Object.freeze({ enabled: false, dailyLimit: 30 }),
    endorse: Object.freeze({ enabled: false, dailyLimit: 10 }),
  }),
});
