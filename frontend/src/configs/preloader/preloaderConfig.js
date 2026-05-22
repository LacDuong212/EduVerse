/**
 * Preloader Configuration
 * 
 * Configure which routes should show/hide the preloader
 * 
 * Options:
 * - excludeRoutes: Routes that should NOT show preloader
 * - includeOnlyRoutes: If set, ONLY these routes show preloader
 * - excludePatterns: Regex patterns to exclude routes
 */

export const preloaderConfig = {
  // Routes that should HIDE preloader
  excludeRoutes: [
    "/404",  // Not found page only
    "/",
    // Add more routes here...
  ],

  // Patterns to exclude (regex)
  excludePatterns: [
    /^\/auth\//, // Exclude all auth routes
  ],

  // If set, ONLY these routes will show preloader
  // Leave empty or null to show on all routes (except excluded)
  includeOnlyRoutes: null,

  // Delay before showing preloader (ms) - useful for quick loads
  showDelay: 200,

  // Fade in/out duration
  transitionDuration: 200,
};

/**
 * Helper function to check if route should show preloader
 */
export const shouldShowPreloader = (pathname) => {
  // Check include-only first
  if (preloaderConfig.includeOnlyRoutes?.length > 0) {
    return preloaderConfig.includeOnlyRoutes.some(route =>
      pathname.startsWith(route)
    );
  }

  // Check exclude patterns
  if (preloaderConfig.excludePatterns?.some(pattern => pattern.test(pathname))) {
    return false;
  }

  // Check exclude routes - be careful with "/" as it matches everything!
  if (preloaderConfig.excludeRoutes?.some(route => {
    // For exact root match
    if (route === "/" && pathname === "/") return true;
    // For other routes, check startsWith
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  })) {
    return false;
  }

  return true;
};