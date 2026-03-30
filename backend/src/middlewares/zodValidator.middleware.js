import AppError from "#exceptions/app.error.js";

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.validated = validatedData;
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;