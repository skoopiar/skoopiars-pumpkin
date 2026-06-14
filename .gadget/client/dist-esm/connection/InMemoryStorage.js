class InMemoryStorage {
  constructor() {
    this.values = {};
  }
  getItem(key) {
    return this.values[key] || null;
  }
  setItem(key, value) {
    this.values[key] = value;
  }
}
export {
  InMemoryStorage
};
//# sourceMappingURL=InMemoryStorage.js.map
