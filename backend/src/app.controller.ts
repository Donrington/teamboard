import { Controller, Get } from '@nestjs/common';

/**
 * Health / liveness endpoint. `GET /api` and `GET /api/health` return a small
 * status payload — handy for uptime checks and the deploy smoke test.
 */
@Controller()
export class AppController {
  @Get(['', 'health'])
  health() {
    return {
      service: 'teamboard-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
