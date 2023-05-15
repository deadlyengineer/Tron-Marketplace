import { useState, useContext, createContext } from "react";

const Context = createContext({
  marketContract: {},
  setMarketContract: () => {},
});

export const ContextProvider = ({ children }) => {
  const [marketContract, setMarketContract] = useState();

  return (
    <Context.Provider value={{ marketContract, setMarketContract }}>
      {children}
    </Context.Provider>
  );
};

export const useMarketContractContext = () => {
  const contract = useContext(Context);

  if (contract) return contract;
  else throw new Error("initializing context is not valid yet");
};
