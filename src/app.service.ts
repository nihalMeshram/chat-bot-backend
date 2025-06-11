import { Injectable } from '@nestjs/common';

/**
 * AppService provides core application-level logic.
 */
@Injectable()
export class AppService {
  /**
   * Returns the health status of the application.
   * This method is typically used in health check endpoints
   * to verify that the server is running correctly.
   *
   * @returns {string} 'ok' - a simple success status
   */
  getHealth(): string {
    return 'ok';
  }
}
