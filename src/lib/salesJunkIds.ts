// Confirmed developer test/dev Provider rows (created while testing the
// registration and Stripe checkout flows, 2026-04-23 to 2026-07-12) — not
// real businesses, so excluded from the sales-autopilot lead pipeline by ID.
//
// This exists instead of an `address: { not: null }` filter because address
// is an OPTIONAL field on the real public registration form — filtering out
// every provider without one would silently exclude genuine future signups
// who just skipped that field, not only this known batch of test data.
export const KNOWN_TEST_PROVIDER_IDS = [
  'cmobd8a710001c7q3kbhm9f7j', // "Jeni s"
  'cmobtrscz0000ziqay0xq0i73', // "frantisek"
  'cmobu8gqp0000nczgyx2b0d9r', // "deagy"
  'cmobupq1i0000xcux1tjbebnm', // "Jeni spj"
  'cmobvqwnc0000l8x19wygseqi', // "fffgfgfgf"
  'cmobvrioo0001l8x1ge4z2qr1', // "ddfgg"
  'cmobwdxm200003zvzai7j9hwj', // "sebin varghese"
  'cmp89ylgn000011o1bp40j6yo', // "Test Provider"
  'cmp8f7nil000010prl08ryio3', // "sebin"
  'cmp8gcj9n0000pqfnphwmd1o5', // "noav"
  'cmrh22tuv0000lvnn4jw2ol87', // "TEST new pricing 10czk+299"
  'cmrh35t2100006evbg5aj6513', // "albi"
  'cmrh3l50z0000q5d5urska9el', // "TEST fixed immediate charge"
] as const;
