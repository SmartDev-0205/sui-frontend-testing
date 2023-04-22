import { TransactionBlock } from '@mysten/sui.js';
import { bcsForVersion } from '@mysten/sui.js';
import { OBJECT_RECORD } from "../config"
import {
    parseSuiRawDataToFarms,
} from '../utils';
import { useMemo, useState } from 'react';
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import BigNumber from 'bignumber.js';

const getProvider = () => {
    return new JsonRpcProvider(
        new Connection({
            fullnode: "https://fullnode.testnet.sui.io:443",
            websocket: "wss://fullnode.testnet.sui.io:443",
            faucet: "https://faucet.testnet.sui.io/gas",
        }))
}

export const useGetFarm = (id: string, account: string) => {

    const [data, setdata] = useState<{}>(NaN);

    useMemo(() => {
        const getFarms = async () => {
            const txb = new TransactionBlock();
            txb.moveCall({
                target: `${OBJECT_RECORD.PACKAGE_ID}::interface::get_farms`,
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEF_STORAGE),
                    txb.object(OBJECT_RECORD.MASTERCHEF_ACCOUNT_STORAGE),
                    txb.pure(account || OBJECT_RECORD.AddressZero),
                    txb.pure(1),
                ],
                typeArguments: [id, id, id, id, id],
            });

            let provider = getProvider();
            console.log("request data a lot");
            const result = await provider.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: account || OBJECT_RECORD.AddressZero,
            });

            const returnValues = result!["results"]![0]!["returnValues"]![0];

            if (!returnValues) return [];
            const bcs = bcsForVersion(await provider.getRpcApiVersion());
            let data = parseSuiRawDataToFarms(
                bcs.de(returnValues[1], Uint8Array.from(returnValues[0]))
            );
            setdata(data);
        }
        getFarms()
    }, [id, account])

    return data;
};

export const useGetPendingRewards = (
    account: string | null,
) => {
    const [data, setdata] = useState<{}>(NaN);
    useMemo(() => {
        const getPendingRewards = async () => {

            const txb = new TransactionBlock();
            console.log("address -----------------", account);
            txb.moveCall({
                target: `${OBJECT_RECORD.PACKAGE_ID}::master_chef::get_pending_rewards`,
                typeArguments: ["0x2::sui::SUI"],
                // typeArguments: [`${OBJECT_RECORD.PACKAGE_ID}::ipx::IPX`],
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEF_STORAGE),
                    txb.object(OBJECT_RECORD.MASTERCHEF_ACCOUNT_STORAGE),
                    txb.object(OBJECT_RECORD.CLOCK_OBJECT),
                    txb.pure(account || OBJECT_RECORD.AddressZero),
                ],
            });

            let provider = getProvider();
            const result = await provider.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: account || OBJECT_RECORD.AddressZero,
            });

            console.log("returnValues-0-------------", result);
            const returnValues = result!["results"]![0]!["returnValues"]![0];

            let total_pending_rewawrds = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues[1],
                Uint8Array.from(returnValues[0])
            );
            console.log("total_pending_rewawrds---------------", total_pending_rewawrds);
            setdata(total_pending_rewawrds);
        }
        getPendingRewards();
    }, [account])
    return data;
};


export const useGetPoolInfo = () => {
    const [data, setdata] = useState<{}>();
    useMemo(() => {
        const getPoolInfo = async () => {
            const txb = new TransactionBlock();
            txb.moveCall({
                target: `${OBJECT_RECORD.PACKAGE_ID}::master_chef::get_pool_info`,
                typeArguments: ["0x2::sui::SUI"],
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEF_STORAGE),
                ],
            });

            let provider = getProvider();
            const result = await provider.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: OBJECT_RECORD.AddressZero,
            });

            const returnValues = result!["results"]![0]!["returnValues"];
            console.log("pool------------",returnValues);
            
            let allocationPoints = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues![0]![1],
                Uint8Array.from(returnValues![0]![0])
            );

            let lastRewardTimeStamp = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues![1]![1],
                Uint8Array.from(returnValues![1]![0])
            );

            let accruedIPXPerShare = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues![2]![1],
                Uint8Array.from(returnValues![2]![0])
            );

            let balanceValue = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues![3]![1],
                Uint8Array.from(returnValues![3]![0])
            );

            const results = {
                AllocationPoints: allocationPoints,
                LastRewardTimeStamp: lastRewardTimeStamp,
                AccruedIPXPerShare: accruedIPXPerShare,
                BalanceValue: balanceValue,
            }
            console.log("pool result-------------",results);
            setdata(results)
        }
        getPoolInfo();
    }, [])
    return data;
};