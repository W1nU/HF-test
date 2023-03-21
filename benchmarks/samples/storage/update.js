/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const Promise = require("bluebird");

/**
 * Workload module for the benchmark round.
 */
class UpdateWorkload extends WorkloadModuleBase {
  /**
   * Initializes the workload module instance.
   */
  constructor() {
    super();
    this.txIndex = 0;
    this.limitIndex = 0;
    this.ids = [];
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize the workload module with the given parameters.
   * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
   * @param {number} totalWorkers The total number of workers participating in the round.
   * @param {number} roundIndex The 0-based index of the currently executing round.
   * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
   * @param {BlockchainInterface} sutAdapter The adapter of the underlying SUT.
   * @param {Object} sutContext The custom context object provided by the SUT adapter.
   * @async
   */
  async initializeWorkloadModule(
    workerIndex,
    totalWorkers,
    roundIndex,
    roundArguments,
    sutAdapter,
    sutContext
  ) {
    await super.initializeWorkloadModule(
      workerIndex,
      totalWorkers,
      roundIndex,
      roundArguments,
      sutAdapter,
      sutContext
    );

    const promises = [];

    for (let i = 0; i < 600; i++) {
      let id = "Client" + this.workerIndex + "_Asset_" + i;
      this.ids.push(id);

      let args = {
        contractId: "fabcar",
        contractVersion: "v1",
        contractFunction: "CreateAsset",
        contractArguments: [id, "blue", 5, this.workerIndex, 300],
        timeout: 600,
      };

      promises.push(async () => {
        await this.sutAdapter.sendRequests(args);
        console.log(args.contractArguments[0] + " created");
      });
    }

    await Promise.map(promises, (fn) => fn(), { concurrency: 10 });

    await this.sleep(60000);
  }

  /**
   * Assemble TXs for the round.
   * @return {Promise<TxStatus[]>}
   */
  async submitTransaction() {
    let id = this.ids.shift();

    const org1Peers = ["peer0.org1.example.com", "peer1.org1.example.com"];

    const org2Peers = ["peer0.org2.example.com", "peer1.org2.example.com"];

    // select a peer ramdomly from org1 and org2 and count up the number of txs
    const org1Peer = org1Peers[0];
    const org2Peer = org2Peers[0];

    const peer = [org1Peer, org2Peer];

    let args = {
      contractId: "storageJS",
      contractVersion: "v1",
      contractFunction: "UpdateAsset",
      contractArguments: [id, "red", 10, this.workerIndex, 300],
      timeout: 600,
      readOnly: false,
      targetPeers: peer,
    };

    await this.sutAdapter.sendRequests(args);
    this.txIndex++;
  }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
  return new UpdateWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
