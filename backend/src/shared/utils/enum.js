
export default class Enum {
  constructor(obj) {
    for (const key in obj) {
      this[key] = obj[key];
    }
    // prevent any self-modifications
    return Object.freeze(this);
  }

  keys() {
    return Object.keys(this);
  }

  values() {
    return Object.values(this);
  }

  exists(value) {
    return this.values().includes(value);
  }
}