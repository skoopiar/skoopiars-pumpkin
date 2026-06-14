import { assertOperationSuccess } from "./support.js";
class TransactionRolledBack extends Error {
}
class GadgetTransaction {
  constructor(client, subscriptionClient) {
    this.client = client;
    this.subscriptionClient = subscriptionClient;
    this.open = false;
  }
  /** Shut down this transaction by closing the connection to the backend. */
  close() {
    if (this.open) {
      void this.rollback().catch(() => null);
    }
    void this.subscriptionClient.dispose();
  }
  /** Explicitly roll back this transaction, preventing any of the changes made during it from being committed. */
  async rollback() {
    assertOperationSuccess(await this.client.mutation(`mutation RollbackTransaction { internal { rollbackTransaction }}`, {}).toPromise(), [
      "internal",
      "rollbackTransaction"
    ]);
    this.open = false;
    throw new TransactionRolledBack("Transaction rolled back.");
  }
  /**
   * @private
   */
  async start() {
    assertOperationSuccess(await this.client.mutation(`mutation StartTransaction { internal { startTransaction }}`, {}).toPromise(), [
      "internal",
      "startTransaction"
    ]);
    this.open = true;
  }
  /**
   * @private
   */
  async commit() {
    assertOperationSuccess(await this.client.mutation(`mutation CommitTransaction { internal { commitTransaction }}`, {}).toPromise(), [
      "internal",
      "commitTransaction"
    ]);
    this.open = false;
  }
}
export {
  GadgetTransaction,
  TransactionRolledBack
};
//# sourceMappingURL=GadgetTransaction.js.map
