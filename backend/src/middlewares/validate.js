import AppError from "#exceptions/app.error.js";

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;

    return next();
  } catch (error) {
    const formattedErrors = error.errors.map(e => ({
      field: e.path.length > 1 ? e.path[1] : e.path[0],
      message: e.message
    }));

    const validationError = new AppError("Validation Failed", 400, formattedErrors);
    next(validationError);
  }
};

export default validate;