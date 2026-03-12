import AppError from "#exceptions/app.error.js";

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (validatedData.body) {
      req.body = validatedData.body;
    }

    // !!! Express protects req.query and req.params, blocking direct assignment
    // use Object.assign to merge validated data back into req.query and req.params
    if (validatedData.query) {
      Object.assign(req.query, validatedData.query);
    }
    if (validatedData.params) {
      Object.assign(req.params, validatedData.params);
    }

    return next();
  } catch (error) {
    const issues = error.issues || error.errors;

    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map(e => ({
        field: e.path,
        message: e.message
      }));

      const validationError = new AppError("Validation Failed", 400, formattedErrors);
      return next(validationError);
    }

    next(error);
  }
};

export default validate;