// Import the Fastify types to allow module augmentation
import 'fastify';

/**
 * Module augmentation for Fastify to include custom `user` object on the request.
 * This is useful for type-safe access to authenticated user data added via middleware or guards.
 */
declare module 'fastify' {
  interface FastifyRequest {
    /**
     * Optional `user` property added after successful authentication (e.g., via JWT guard).
     * This allows downstream handlers to access the authenticated user's ID, email, and role.
     */
    user?: {
      userId: string; // Unique identifier of the authenticated user
      email: string;  // Email of the authenticated user
      role: string;   // Role of the user (e.g., 'admin', 'user')
    };
  }
}
