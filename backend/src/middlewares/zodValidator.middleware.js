import AppError from "#exceptions/app.error.js";

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // !!! Express protects req.query and req.params
    // so we'll store elsewhere
    req.validated = validatedData;

    return next();
  } catch (error) {
    const issues = error.issues || error.errors;

    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));

      const validationError = new AppError("Validation Failed", 400, formattedErrors);
      return next(validationError);
    }

    next(error);
  }
};

export default validate;