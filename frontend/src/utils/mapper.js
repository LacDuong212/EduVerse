
export const mapResponseErrors = (errorsArr) => {
  if (!errorsArr || !Array.isArray(errorsArr)) return {};

  return errorsArr.reduce((acc, error) => {
    const key = error.field || "general";
    acc[key] = error.message;
    return acc;
  }, {});
};

export const mapZodErrors = (zodError) => {
  const fieldErrors = {};
  zodError.issues.forEach((issue) => {
    const pathKey = issue.path.join(".");
    fieldErrors[pathKey] = issue.message;
  });
  return fieldErrors;
};
