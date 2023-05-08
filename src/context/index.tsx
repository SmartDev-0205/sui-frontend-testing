import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";

const StakingContext = createContext([]);

export const useStakingchainContext = () => {
  return useContext(StakingContext);
};

const INIT_STATE = {
  // Wallet varible
  address: "",
  balance: "0.000",
  // Stake Variable
  totalStaked: "Loading...",
  lastRewardTime: "Loading...",
  accruedToken: "Loading...",
  allocationProfit: "Loading...",
  // Referral Variable
  totalTradingValume: "Loading...",
  totalReward: "Loading...",
  totalUsers: "Loading...",
  unclaimedSui: "Loading...",
};

const reducer = (state: any, { type, payload }: any) => {
  return {
    ...state,
    [type]: payload,
  };
};



export const Provider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);
  const changeVariable = ({ key, value }: any) => {
    dispatch({
      type: key,
      payload: value,
    });
  };
  return (
    <StakingContext.Provider value={{...state,changeVariable }}>
      {children}
    </StakingContext.Provider>
  );
};
