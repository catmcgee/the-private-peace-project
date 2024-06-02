import { createContext } from "react";


export interface IMetaMaskContext {
    metaMaskDisplay: string;
    metaMask: string;
    updateMetaMaskDisplay?: (value : string) => void;
    updateMetaMask?: (value : string) => void;

  }
  
  export const defaultState = {
    metaMask: "",
    metaMaskDisplay: "",
  };
  
export const MetaMaskContext = createContext<IMetaMaskContext>(defaultState);


