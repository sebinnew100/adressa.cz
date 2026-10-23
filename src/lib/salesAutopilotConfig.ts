// Single source of truth for the sales-pitch-email kill-switch — checked by
// both the automated cron (sales-autopilot) and the manual admin send route,
// so flipping this one value actually stops every path that can send a
// pitch email, not just the automated one.
export const SALES_EMAILS_PAUSED = true;
