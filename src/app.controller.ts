import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * AppController handles basic application-level routes.
 * Primarily used for system health checks or root endpoints.
 */
@ApiTags('App') // Tags the controller for grouping in Swagger UI
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
  @ApiOperation({ summary: 'Check health', description: 'Returns the health status of the application.' })
  @ApiResponse({ status: 200, description: 'Application is healthy.' })
  getHealth(): string {
    return this.appService.getHealth();
  }
}
