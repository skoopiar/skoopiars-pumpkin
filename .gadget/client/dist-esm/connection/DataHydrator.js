const Hydrators = {
  DateTime(value) {
    return new Date(value);
  }
};
class DataHydrator {
  constructor(plan) {
    this.plan = plan;
  }
  apply(source) {
    if (Array.isArray(source)) {
      return source.map((object) => this.hydrateObject(object));
    } else {
      return this.hydrateObject(source);
    }
  }
  hydrateObject(object) {
    const hydrated = { ...object };
    for (const [key, hydrator] of Object.entries(this.plan)) {
      const value = hydrated[key];
      if (value != null) {
        hydrated[key] = Hydrators[hydrator](value);
      }
    }
    return hydrated;
  }
}
export {
  DataHydrator,
  Hydrators
};
//# sourceMappingURL=DataHydrator.js.map
