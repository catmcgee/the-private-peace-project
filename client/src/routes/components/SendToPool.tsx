import { LiquidityPool } from "../FundingPage";
import styled from 'styled-components'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { HeaderText } from "../Root";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { MetaMaskContext } from "../MetaMaskContext";
import { Contract, utils, BigNumber, providers, ethers } from "ethers";
import { PPP_ABI, PPP_CONTRACT_ADDRESS } from "../../constants";
import { Client } from "@xmtp/xmtp-js";

import { buildMimc7 as buildMimc } from 'circomlibjs';

export interface ISendToPoolProps {
    poolType: LiquidityPool
};

function toHexString(byteArray: Uint8Array): string {
    return '0x' + Array.from(byteArray, byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}



export const VerticalDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`
export default function SendToPool({ poolType }: ISendToPoolProps) {

    const { metaMask } = useContext(MetaMaskContext);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const navigate = useNavigate();

    const moveToPage = () => {
        if (metaMask)
            navigate('/select');
        else
            navigate("/");
    }

    const depositClick = async (metamask: string, onOpen: () => void) => {
        const provider = new ethers.providers.Web3Provider(window?.ethereum as any);
        const signer = provider.getSigner();
        const xmtp = await Client.create(signer, {
            env: 'production'
        });
        
        await deposit(metamask, onOpen);
        // TODO handle transaction sending/feedback/closure
    }
    
    const deposit = async (metamask: string, onOpen: () => void) => {
        // Generate commitment for deposit function
        const nullifier = utils.randomBytes(32);
        const secret = utils.randomBytes(32);
        const mimc = await buildMimc();
        const note = mimc.multiHash([nullifier, secret]);
        const noteHex = toHexString(note);
    
        const noteValue = BigNumber.from(noteHex).mod(BigNumber.from("21888242871839275222246405745257275088548364400416034343698204186575808495617")).toHexString();
        const provider = window.ethereum;
        const iface = new utils.Interface(PPP_ABI);
        const functionData = iface.encodeFunctionData("deposit", [noteValue])
    
        if (provider)
            await provider.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        // TODO replace "from" with connected metamask address
                        from: metamask,
                        to: "0xc127cC043AF2c160c84e7eF26a3113F4f4283639",
                        value: "0x2386F26FC10000", // 0.01 
                        data: functionData,
                    },
                ]
            })
        onOpen();
    };


    return (
        <VerticalDiv>
            <div style={{ marginTop: '40px' }}>
            </div>
            <Input isReadOnly style={{ color: 'white', height:'40px' }} type='email' label={<HeaderText>Eth Donation</HeaderText>} color='secondary' variant="bordered" defaultValue="0.01" />
            <VerticalDiv style={{ alignItems: 'end' }}>
                <Button style={{ marginTop: '20px', width: '90px', height:'50px' }} color='secondary' onPress={() => depositClick(metaMask, onOpen)}> Donate ETH</Button>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Donation Successful</ModalHeader>
                                <ModalBody>
                                    <p>
                                        Donation sent.
                                    </p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={() => { onClose(); moveToPage(); }}>
                                        Close
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </VerticalDiv>
        </VerticalDiv>
    )
}