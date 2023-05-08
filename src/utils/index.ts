import BigNumber from 'bignumber.js';
import { Connection, JsonRpcProvider } from "@mysten/sui.js";

export const parseSuiRawDataToFarms = (
  x: ReadonlyArray<ReadonlyArray<BigInt>>
) =>
  x.map((elem: ReadonlyArray<BigInt>) => ({
    allocationPoints: BigNumber(elem[0].toString()),
    totalStakedAmount: BigNumber(elem[1].toString()),
    accountBalance: BigNumber(elem[2].toString()),
  }));

export const parseSuiRawDataToPoolInfo = (
  x: ReadonlyArray<ReadonlyArray<BigInt>>
) =>
  x.map((elem: ReadonlyArray<BigInt>) => ({
    allocationPoints: BigNumber(elem[0].toString()),
    lastRewardTimeStamp: BigNumber(elem[1].toString()),
    accruedIPXPerShare: BigNumber(elem[2].toString()),
    balanceValue: BigNumber(elem[3].toString()),
  }));


export const getProvider = () => {
  return new JsonRpcProvider(
    new Connection({
      fullnode: "https://wallet-rpc.testnet.sui.io/",
      websocket: "wss://fullnode.testnet.sui.io:443",
      faucet: "https://faucet.testnet.sui.io/gas",
    }))
}