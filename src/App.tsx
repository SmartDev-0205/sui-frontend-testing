// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import "./App.css";
import { ConnectButton, useWalletKit } from "@mysten/wallet-kit";
import { TransactionBlock } from "@mysten/sui.js";
import { bcsForVersion } from "@mysten/sui.js";
import { useEffect, useState } from "react";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";

import BigNumber from "bignumber.js";
import { useGetFarm, useGetPendingRewards, useGetPoolInfo } from "./hooks";

const parseSuiRawDataToFarms = (x: ReadonlyArray<ReadonlyArray<BigInt>>) =>
  x.map((elem: ReadonlyArray<BigInt>) => ({
    allocationPoints: BigNumber(elem[0].toString()),
    totalStakedAmount: BigNumber(elem[1].toString()),
    accountBalance: BigNumber(elem[2].toString()),
  }));

function App() {
  const {
    currentWallet,
    currentAccount,
    signTransactionBlock,
    signAndExecuteTransactionBlock,
    signMessage,
  } = useWalletKit();

  useGetPoolInfo();
  const id = "0x2::sui::SUI";
  const data = useGetFarm(id, currentAccount?.address ||
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  console.log("--------------Farm-------------", data);

  const pendingRewards = useGetPendingRewards(
    currentAccount?.address ||
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  console.log("--------------Pendingrewards-------------", pendingRewards);

  useEffect(() => {
    // You can do something with `currentWallet` here.
  }, [currentWallet]);

  const testNetProvider = new JsonRpcProvider(
    new Connection({
      fullnode: "https://fullnode.testnet.sui.io:443",
      websocket: "wss://fullnode.testnet.sui.io:443",
      faucet: "https://faucet.testnet.sui.io/gas",
    })
  );

  const [balance,setAccountBalance] = useState ("0");
  useEffect (()=>{
    const getbalance = async() =>{
      let accountBalance =await testNetProvider.getBalance({owner:'0x7bfd5325cb4641b13101d92fc31fe058c23e9efa4fabd45b895bb7e44ae45ba9'});
      setAccountBalance(accountBalance?.totalBalance || "0");
      console.log("Account balance",balance);
    }
    getbalance();
  })
  

  const buy = async () => {
    const txb = new TransactionBlock();
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(10)]);
    // console.log(
    //   await signAndExecuteTransactionBlock({ transactionBlock: txb })
    // );
    console.log("--------------------------Starting buy----------------------");
    const packageObjectId =
      "0x0a86a3396477ac82241b8b0f858d74922427499d234699d1688d47bfec4b3858";
    txb.moveCall({
      target: `${packageObjectId}::sandwich::buy_ham`,
      arguments: [
        txb.object(
          "0x91028f1b1576360ad6603870d62ba79a108c4e229734a31c78e5dfbee92e3f0f"
        ),
        coin,
      ],
      typeArguments: [],
    });
    txb.setGasBudget(300000000);
    console.log(
      await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        requestType: "WaitForEffectsCert",
        options: { showEffects: true },
      })
    );
  };

  const staking = async () => {
    const txb = new TransactionBlock();
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(1000000000)]);
    // console.log(
    //   await signAndExecuteTransactionBlock({ transactionBlock: txb })
    // );
    console.log(
      "--------------------------Starting Staking----------------------"
    );
    const packageObjectId =
      "0xd456287c633d1d165e7ce55844f0deb168353f78301141ea7085a52b427a1d12";
    txb.moveCall({
      target: `${packageObjectId}::interface::stake`,
      arguments: [
        txb.object(
          "0xce299f8b767395420500434d27f98aef54b5cedb064f1463533579fa5e9172cb"
        ),
        txb.object(
          "0xc302cf5542637507e8237343e6f381b206be1cb3ba737f7fd8a013f848bf828b"
        ),
        txb.object(
          "0xbeb57d11545e9a2526c0cad63ae9c72c2f0d2bed1916b2690761fd2c35279a86"
        ),
        txb.object(
          "0x0000000000000000000000000000000000000000000000000000000000000006"
        ),
        coin,
      ],
      typeArguments: ["0x2::sui::SUI"],
    });
    txb.setGasBudget(300000000);
    const tx = await signAndExecuteTransactionBlock({
      transactionBlock: txb,
      requestType: "WaitForEffectsCert",
      options: { showEffects: true },
    });
    console.log(tx);
  };

  const unstaking = async () => {
    const txb = new TransactionBlock();
    // console.log(
    //   await signAndExecuteTransactionBlock({ transactionBlock: txb })
    // );
    console.log(
      "--------------------------Starting Staking----------------------"
    );
    const packageObjectId =
      "0xd456287c633d1d165e7ce55844f0deb168353f78301141ea7085a52b427a1d12";
    txb.moveCall({
      target: `${packageObjectId}::interface::unstake`,
      arguments: [
        txb.object(
          "0xce299f8b767395420500434d27f98aef54b5cedb064f1463533579fa5e9172cb"
        ),
        txb.object(
          "0xc302cf5542637507e8237343e6f381b206be1cb3ba737f7fd8a013f848bf828b"
        ),
        txb.object(
          "0xbeb57d11545e9a2526c0cad63ae9c72c2f0d2bed1916b2690761fd2c35279a86"
        ),
        txb.object(
          "0x0000000000000000000000000000000000000000000000000000000000000006"
        ),
        txb.pure(1000000000),
      ],
      typeArguments: ["0x2::sui::SUI"],
    });
    txb.setGasBudget(300000000);
    const tx = await signAndExecuteTransactionBlock({
      transactionBlock: txb,
      requestType: "WaitForEffectsCert",
      options: { showEffects: true },
    });
    console.log(tx);
  };

  const getFarm = async () => {
    const txb = new TransactionBlock();
    console.log("--------------------------getFarm----------------------");
    const id =
      "0x35fdd5170d77c76de3145374dc5e3b3814e2e19dd6b44cba8e1cb298b01ee23a::ipx::IPX";
    const packageObjectId =
      "0x35fdd5170d77c76de3145374dc5e3b3814e2e19dd6b44cba8e1cb298b01ee23a";
    txb.moveCall({
      target: `${packageObjectId}::interface::get_farms`,
      arguments: [
        txb.object(
          "0xd94e6a28612373bbba9f9a427897c4c8c9bff40e0d7945770b092dbfc0a2567d"
        ),
        txb.object(
          "0xa5b14bfe841d9a5cba409ad8c25ea4d4d5aea9e27ba38a9382ea2d1cdd763940"
        ),
        txb.pure(
          currentAccount?.address ||
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        ),
        txb.pure(1),
      ],
      typeArguments: [id, id, id, id, id],
    });
    // txb.setGasBudget(300000000);
    console.log("testnet provider ------------", testNetProvider);
    const resultvalue = await testNetProvider.devInspectTransactionBlock({
      transactionBlock: txb,
      sender:
        currentAccount?.address ||
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });
    console.log(
      "----------------results -----------------------",
      resultvalue!["results"]![0]!["returnValues"]![0]
    );

    if (!resultvalue) {
      console.log("return null");
      return [];
    }

    const bcs = bcsForVersion(await testNetProvider.getRpcApiVersion());
    const result = resultvalue!["results"]![0]!["returnValues"]![0];
    if (!result) return;
    let parsesui = parseSuiRawDataToFarms(
      bcs.de(result[1], Uint8Array.from(result[0]))
    );
    console.log("total result", parsesui);
  };

  const testFarmHook = async () => {};

  return (
    <div className="App">
      <ConnectButton />
      <div>
        <button
          onClick={async () => {
            const txb = new TransactionBlock();
            const [coin] = txb.splitCoins(txb.gas, [txb.pure(1)]);
            txb.transferObjects([coin], txb.pure(currentAccount!.address));

            console.log(await signTransactionBlock({ transactionBlock: txb }));
          }}
        >
          Sign Transaction
        </button>
      </div>
      <div>
        <button
          onClick={async () => {
            const txb = new TransactionBlock();
            const [coin] = txb.splitCoins(txb.gas, [txb.pure(1000000000)]);
            txb.transferObjects(
              [coin],
              txb.pure(
                "0x257e8a74f266e815a421c7eceaf09dcb48fcc4eabebb4e7ab6945074f4625f68"
              )
            );

            console.log(
              await signAndExecuteTransactionBlock({
                transactionBlock: txb,
                options: { showEffects: true },
              })
            );
          }}
        >
          Sign + Execute Transaction
        </button>
      </div>
      <div>
        <button
          onClick={async () => {
            console.log(
              await signMessage({
                message: new TextEncoder().encode("Message to sign"),
              })
            );
          }}
        >
          Sign message
        </button>

        <button onClick={buy}>buy sandwitch</button>
      </div>

      <div>
        <button onClick={staking}>Staking</button>

        <button onClick={unstaking}>Unstaking</button>
      </div>

      <div>
        <button onClick={getFarm}>getfarm</button>

        <button onClick={testFarmHook}>Unstaking</button>
      </div>
    </div>
  );
}

export default App;
