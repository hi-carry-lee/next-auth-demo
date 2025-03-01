/**
 * An array of routes that are accessible to the public
 * these routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ["/"];

/**
 * An array of routes that are used for authentication
 * these routes will redirect logged in users to /settings（/settings is for test）
 * @type {string[]}
 */
export const authRoutes: string[] = ["/auth/login", "/auth/register"];

/**
 * The prefix for API authentication routes,
 * Routes that start with this prefix are used for API authentication purposes,
 * The routes prefix with "/api/auth" is something like /api/auth/signin or /api/auth/signout,
 * and these routes should pass through;
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after logging
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/settings";
