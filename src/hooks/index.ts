import { TransactionBlock } from '@mysten/sui.js';
import { bcsForVersion } from '@mysten/sui.js';
import { OBJECT_RECORD } from "../config"
import {
    parseSuiRawDataToFarms,
} from '../utils';
import { useMemo, useState } from 'react';
import { Connection, JsonRpcProvider } from "@mysten/sui.js";

const getProvider = () => {
    return new JsonRpcProvider(
        new Connection({
            fullnode: "https://wallet-rpc.devnet.sui.io/",
            websocket: "wss://fullnode.devnet.sui.io:443",
            faucet: "https://faucet.devnet.sui.io/gas",
        }))
}

export const useGetFarm = (id: string, account: string) => {

    const [data, setdata] = useState<{}>(NaN);

    useMemo(() => {
        const getFarms = async () => {
            const txb = new TransactionBlock();
            txb.moveCall({
                target: `${OBJECT_RECORD.PACKAGEID}::interface::get_farms`,
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEFSTORAGE),
                    txb.object(OBJECT_RECORD.MASTERCHEFACCOUNTSTORAGE),
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
                target: `${OBJECT_RECORD.PACKAGEID}::master_chef::get_pending_rewards`,
                typeArguments: ["0x2::sui::SUI"],
                // typeArguments: [`${OBJECT_RECORD.PACKAGEID}::ipx::IPX`],
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEFSTORAGE),
                    txb.object(OBJECT_RECORD.MASTERCHEFACCOUNTSTORAGE),
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
                target: `${OBJECT_RECORD.PACKAGEID}::master_chef::get_pool_info`,
                typeArguments: ["0x2::sui::SUI"],
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEFSTORAGE),
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



export const useGetDepositValue = () => {
    const [data, setdata] = useState<{}>();
    useMemo(() => {
        const getDepositValue = async () => {
            const txb = new TransactionBlock();
            const packageId = OBJECT_RECORD.PACKAGEID;
            const balanceStorage = OBJECT_RECORD.MASTERCHEFBALANCE;
            txb.moveCall({
                target: `${packageId}::master_chef::get_currrent_value`,
                typeArguments: [],
                arguments: [
                    txb.object(balanceStorage),
                ],
            });

            let provider = getProvider();
            const result = await provider.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: OBJECT_RECORD.AddressZero,
            });

            const returnValues = result!["results"]![0]!["returnValues"];
            console.log("pool------------",returnValues);
            
            let depositValue = bcsForVersion(await provider.getRpcApiVersion()).de(
                returnValues![0]![1],
                Uint8Array.from(returnValues![0]![0])
            );

            console.log("pool result-------------",depositValue);
            setdata(depositValue)
        }
        getDepositValue();
    }, [])
    return data;
};



export const useGetObject = (objectAddress:string) => {
    useMemo(() => {
        const getDepositValue = async () => {
            let provider = getProvider();
            let rpcOption = {
                showContent:true
            }
            let result = await provider.getObject({id:objectAddress,options:rpcOption});
            console.log("publisher------------------",result);
        }
        getDepositValue();
    }, [])
};


export const useGetAccountInfo = (account: string) => {

    const [data, setdata] = useState<{}>(NaN);
    console.log("current -account----------",account);

    useMemo(() => {
        const getAccount = async () => {
            const txb = new TransactionBlock();
            txb.moveCall({
                target: `${OBJECT_RECORD.PACKAGEID}::master_chef::get_account_detail`,
                arguments: [
                    txb.object(OBJECT_RECORD.MASTERCHEFSTORAGE),
                    txb.object(OBJECT_RECORD.MASTERCHEFACCOUNTSTORAGE),
                    txb.pure(account || OBJECT_RECORD.AddressZero),
                ],
                typeArguments: [],
            });
            let provider = getProvider();
            const result = await provider.devInspectTransactionBlock({
                transactionBlock: txb,
                sender: account || OBJECT_RECORD.AddressZero,
            });

            if (result!["results"]){

                const returnValues = result!["results"]![0]!["returnValues"];
                let totalStaked = bcsForVersion(await provider.getRpcApiVersion()).de(
                    returnValues![0]![1],
                    Uint8Array.from(returnValues![0]![0])
                );
    
                let totalRewards = bcsForVersion(await provider.getRpcApiVersion()).de(
                    returnValues![3]![1],
                    Uint8Array.from(returnValues![3]![0])
                );
    
                let totalUsers = bcsForVersion(await provider.getRpcApiVersion()).de(
                    returnValues![2]![1],
                    Uint8Array.from(returnValues![2]![0])
                );
    
                let unclaimedRewards = bcsForVersion(await provider.getRpcApiVersion()).de(
                    returnValues![4]![1],
                    Uint8Array.from(returnValues![4]![0])
                );
    
                const results = {
                    TotalStaked: totalStaked,
                    TotalRewards: totalRewards,
                    TotalUsers: totalUsers,
                    UnclaimedRewards: unclaimedRewards,
                }

                console.log("result-----",results);
                setdata(results);
            }else{
                const results = {
                    TotalStaked: 0,
                    TotalRewards: 0,
                    TotalUsers: 0,
                    UnclaimedRewards: 0,
                }
                setdata(results);
            }
            console.log("Account info -----------------", data);
        }
        getAccount()
    }, [account])

    return data;
};
