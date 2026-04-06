
const logger = {
  debug: (msg, meta = {}) => {
    // if (process.env.NODE_ENV === "development" || process.env.LOG_LEVEL === "debug") {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[2m[DEBUG] [${timestamp}] ${msg}\x1b[0m`, Object.keys(meta).length ? meta : '');
    // }
  },
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
    const { statusCode } = err;
    const { method, originalUrl, ip } = req;
    const timestamp = new Date().toISOString();

    console.error("\x1b[31m%s\x1b[0m", `[EXCEPTION] [${timestamp}] -----------------------`);
    console.error(`Method: ${method} | URL: ${originalUrl} | Code: ${statusCode || 500} | IP: ${ip}`);

    console.error(`Message: ${err.message}`);

    if (err.cause) {
      console.error("\x1b[35mCause:\x1b[0m %s", err.cause.message || err.cause);

      if (process.env.NODE_ENV === "development" && err.cause.stack) {
        console.error("\x1b[2m%s\x1b[0m", err.cause.stack);
        console.error("\x1b[35m%s\x1b[0m", "^^^ Internal Error Stack Above ^^^");
      }
    } else if (process.env.NODE_ENV === "development" && err.stack) {
      console.error("\x1b[2m%s\x1b[0m", err.stack);
    }

    console.error("\x1b[31m%s\x1b[0m", "--------------------------------------------------------------");
  }
};

export default logger;