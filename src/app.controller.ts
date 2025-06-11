import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController handles basic application-level routes.
 * Primarily used for system health checks or root endpoints.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * GET /health
   * Endpoint to check the application's health status.
   * Useful for monitoring and uptime verification by load balancers or external systems.
   *
   * @returns {string} Health status message (e.g., 'ok')
   */
  @Get('/health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
