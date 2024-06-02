import { Button } from "@nextui-org/react";
import { ConnectDiv, HeaderText } from "./Root";
import { useNavigate } from "react-router-dom";
import { MetaMaskSDK } from "@metamask/sdk";
import { useContext } from "react";
import { MetaMaskContext } from "./MetaMaskContext";

export default function Connect() {
  
  const navigate = useNavigate();
  const {updateMetaMaskDisplay, updateMetaMask} = useContext(MetaMaskContext);

  const MMSDK = new MetaMaskSDK({
    dappMetadata: {
      name: "Test me MetaMask",
      url: window.location.href,
    },
    infuraAPIKey: '3e104cfcc08e454ab7c0a3d4f90a1281',
    // Other options.
  });

  const doStuff = () => {
    let ethereum = MMSDK.getProvider();
    ethereum?.request({ method: "eth_requestAccounts", params: [] }).then(x => {
      let test : any = x;
      let start : string = test[0].substr(0,6);
      let end : string = test[0].substr(-4);
      if(updateMetaMaskDisplay)
        updateMetaMaskDisplay(start + "..." + end);
      if(updateMetaMask)
        updateMetaMask(test[0]);
    }).finally(() => {
      navigate('/select')
    }
    );
  }

  return (
    <ConnectDiv>
      <HeaderText>Click Here to connect via Metamask Wallet</HeaderText>
      <Button color="secondary" style={{ marginRight: '20px' }} onClick={doStuff}>Connect To Metamask</Button>
    </ConnectDiv>
  );
}