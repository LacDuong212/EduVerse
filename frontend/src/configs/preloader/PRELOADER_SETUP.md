# Global Preloader Setup Guide

## Overview
You now have a fully integrated global preloader that displays across your entire app with route-based control.

## Features
✅ **Global preloader** - Shows on route changes  
✅ **Route exclusion** - Hide preloader on specific routes  
✅ **Route patterns** - Use regex patterns for flexible matching  
✅ **Fade animations** - Smooth transitions with configurable delays  
✅ **Non-blocking** - Pointer events disabled when hidden  

## How It Works

### 1. **Components Created**

| File | Purpose |
|------|---------|
| `src/contexts/PreloaderContext.jsx` | State management for preloader |
| `src/components/GlobalPreloader/` | Main preloader wrapper component |
| `src/components/RoutePreloaderListener.jsx` | Auto-triggers preloader on route change |
| `src/configs/preloaderConfig.js` | Configuration for routes |

### 2. **Integration** (Already Done)
- Wrapped app with `PreloaderProvider`
- Added `GlobalPreloader` component
- Added `RoutePreloaderListener` in router

---

## Configuration

Edit `src/configs/preloaderConfig.js` to customize behavior:

```javascript
export const preloaderConfig = {
  // Routes that HIDE preloader
  excludeRoutes: [
    '/auth/sign-in',
    '/auth/sign-up',
    // Add more...
  ],

  // Regex patterns to exclude
  excludePatterns: [
    /^\/auth\//,      // Hide on all /auth/* routes
    /^\/admin/,       // Hide on /admin routes
  ],

  // If set, ONLY these routes show preloader
  includeOnlyRoutes: null,

  // Delay before showing (ms) - prevents flash on quick loads
  showDelay: 200,

  // Transition duration (ms)
  transitionDuration: 300,
};
```

---

## Usage Examples

### Example 1: Hide preloader on auth pages
Already configured! Routes starting with `/auth/` are excluded.

### Example 2: Only show preloader on checkout
```javascript
includeOnlyRoutes: [
  '/shop/checkout',
  '/shop/payment-result',
],
```

### Example 3: Exclude multiple patterns
```javascript
excludePatterns: [
  /^\/auth\//,
  /^\/admin/,
  /^\/settings/,
],
```

### Example 4: Manual control (if needed)
```javascript
import { usePreloader } from '@/contexts/PreloaderContext';

function MyComponent() {
  const { setIsLoading } = usePreloader();

  const handleSlowOperation = async () => {
    setIsLoading(true);
    // ... do something
    setIsLoading(false);
  };

  return <button onClick={handleSlowOperation}>Start</button>;
}
```

---

## Styling

Customize preloader appearance in `src/components/GlobalPreloader/styles.css`:

```css
.global-preloader-wrapper {
  background: rgba(255, 255, 255, 0.95);  /* Change background */
  z-index: 9999;                          /* Adjust z-index if needed */
}
```

---

## What Happens Now

1. **Page loads** → Preloader is hidden
2. **User navigates** → Preloader shows if route is included
3. **Component loads** → Preloader hides automatically after 500ms
4. **Quick navigations** → Preloader won't flash (200ms delay)

---

## Troubleshooting

**Q: Preloader shows on auth pages**  
A: Add routes to `excludeRoutes` or add pattern `/^\/auth\//` to `excludePatterns`

**Q: Preloader flashes briefly**  
A: Increase `showDelay` in config (e.g., 300 or 500)

**Q: Preloader hides too quickly**  
A: Adjust the `setTimeout(500)` in `RoutePreloaderListener` component

**Q: Preloader blocks clicks**  
A: It should auto-hide when `isLoading` is false. Check that `setIsLoading(false)` is called.

---

## Next Steps

1. Test navigation between different routes
2. Adjust timing and styling to match your needs
3. Customize excluded/included routes in config
