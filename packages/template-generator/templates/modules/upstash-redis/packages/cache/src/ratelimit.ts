import { Ratelimit } from "@upstash/ratelimit";
import { redis } from ".";

/**
 * Sliding-window rate limiter, keyed per IP / user / whatever you
 * pass as the identifier. Production default: 10 requests / 10 seconds.
 * Tune per route — auth endpoints should be tighter.
 */
export const ratelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

/**
 * Narrower limiter for OTP / login / password-reset routes.
 * 5 attempts per minute.
 */
export const authRatelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "rl:auth",
});
