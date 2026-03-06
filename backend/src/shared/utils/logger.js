
const logger = {
  info: (msg, meta = {}) => {
    console.log(`\x1b[32m[INFO]\x1b[0m [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m [${new Date().toISOString()}] ${msg}`, meta);
  },
  error: (msg, error = {}) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m [${new Date().toISOString()}] ${msg}`, error.stack || error);
  },
  logErrorWithContext: (err, req) => {
    const { method, originalUrl, statusCode, ip } = req;
    
    console.error("\x1b[31m%s\x1b[0m %s\x1b[31m %s\x1b[0m", "[EXCEPTION]", `[${new Date().toISOString()}]`, "------------------");
    console.error(`Method: ${method} | URL: ${originalUrl} | Code: ${statusCode || 500} | IP: ${ip}`);
    console.error(`Message: ${err.message}`);
    
    if (process.env.NODE_ENV === "development" && err.stack) {
      console.error("\x1b[2m%s\x1b[0m", err.stack);
    }
    console.error("\x1b[31m%s\x1b[0m", "---------------------------------------------------------");
  }
};

export default logger;