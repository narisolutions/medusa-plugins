import { authenticate, type MiddlewaresConfig } from "@medusajs/framework"
import { getPluginOptions } from "@/utils/plugin-options"

class SimpleRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly windowMs: number,
    private readonly max: number
  ) {}

  middleware() {
    return (req: any, res: any, next: any) => {
      const key = (req.ip as string) ?? "unknown"
      const now = Date.now()
      let entry = this.store.get(key)

      if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + this.windowMs }
        this.store.set(key, entry)
      }

      entry.count++

      if (entry.count > this.max) {
        res.status(429).json({ message: "Too many requests" })
        return
      }

      next()
    }
  }
}

let _limiterMiddleware: ((req: any, res: any, next: any) => void) | null = null
let _limiterInitialized = false

const posRateLimitMiddleware = (req: any, res: any, next: any) => {
  if (!_limiterInitialized) {
    _limiterInitialized = true
    const opts = getPluginOptions(req.scope).rateLimit
    if (opts) {
      _limiterMiddleware = new SimpleRateLimiter(opts.windowMs, opts.max).middleware()
    }
  }

  if (_limiterMiddleware) {
    _limiterMiddleware(req, res, next)
  } else {
    next()
  }
}

const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: "/pos/*",
      middlewares: [authenticate("user", ["bearer"]), posRateLimitMiddleware],
    },
  ],
}

export default config
