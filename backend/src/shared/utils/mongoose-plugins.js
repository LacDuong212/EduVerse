
export const normalizeId = (schema) => {
  const transform = (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.__v;
  };

  // handle standard Mongoose docs (res.json)
  schema.set("toJSON", { transform, virtuals: true });
  schema.set("toObject", { transform, virtuals: true });

  // handle .lean() queries
  schema.post(["find", "findOne", "findOneAndUpdate", "findByIdAndUpdate"], function (res) {
    if (!res) return;

    const convert = (obj) => {
      if (obj._id) {
        obj.id = obj._id.toString();
        delete obj._id;
      }
      delete obj.__v;
    };

    if (Array.isArray(res)) {
      res.forEach(convert);
    } else {
      convert(res);
    }
  });
};