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

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

const owners = [
  "Tomoko",
  "Brad",
  "Jin Soo",
  "Max",
  "Adrianna",
  "Michel",
  "Aarav",
  "Pari",
  "Valeria",
  "Shotaro",
];

/**
 * Workload module for the benchmark round.
 */
class CreateWorkload extends WorkloadModuleBase {
  /**
   * Initializes the workload module instance.
   */
  constructor() {
    super();
    this.txIndex = 0;
    this.count = {
      org1: {
        peer0: 0,
        peer1: 0,
        peer2: 0,
      },
      org2: {
        peer0: 0,
        peer1: 0,
        peer2: 0,
      },
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
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

    await this.sleep(20000);
  }

  /**
   * Assemble TXs for the round.
   * @return {Promise<TxStatus[]>}
   */
  async submitTransaction() {
    this.txIndex++;
    let id = this.makeid(30);

    const org1Peers = [
      "peer0.org1.example.com",
      "peer1.org1.example.com",
      "peer2.org1.example.com",
    ];

    const org2Peers = [
      "peer0.org2.example.com",
      "peer1.org2.example.com",
      "peer2.org2.example.com",
    ];

    // select a peer ramdomly from org1 and org2 and count up the number of txs
    const org1Peer = org1Peers[0];
    const org2Peer = org2Peers[0];

    const peer = [org1Peer, org2Peer];
    // const peer = ["peer0.org1.example.com", "peer0.org2.example.com"];

    let args = {
      contractId: "fabcar",
      contractVersion: "v1",
      contractFunction: "CreateAsset",
      contractArguments: [
        id,
        this.makeid(30),
        this.makeid(30),
        this.makeid(30),
        this.makeid(30),
      ],
      timeout: 60000,
      targetPeers: peer,
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);

    if (this.txIndex % 1000 === 0) {
      console.log(this.count);
    }
  }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
  return new CreateWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
