
export const mapErrors = (errorsArr) => {
  if (!errorsArr || !Array.isArray(errorsArr)) return {};

  return errorsArr.reduce((acc, error) => {
    const key = error.field || "general";
    acc[key] = error.message;
    return acc;
  }, {});
};
