import { CentreDiv } from "./SelectionPage";
import { HeaderText } from './Root';
import { Button, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@nextui-org/react";
import send from '../assets/send.png'
import { useContext, useEffect, useState } from "react";
import { LiquidityPool } from "./FundingPage";
import { VerticalDiv } from "./components/SendToPool";
import palestine from '../assets/palestine.jpg'
import ukraine from '../assets/ukraine.png'
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from 'ethers';
import { MetaMaskContext } from "./MetaMaskContext";


interface ILocation {
    longitude: number;
    latitude: number;
}

type IParams = {
    id: string | undefined
}

export default function ReceivingPage() {
    const {metaMask} = useContext(MetaMaskContext);
    const { id } = useParams<IParams>();
    const [getLocation, setLocation] = useState<ILocation | null>();
    const [region, setRegion] = useState<LiquidityPool | null>(LiquidityPool.Ukraine);
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [xtmpHasBeenPushed, setXmtpHasBeenPushed] = useState<boolean>(false);
    const [xmtpVal, setXmtpVal] = useState<string>("");

    const moveToPage = () => {
        if (metaMask)
            navigate('/select');
        else
            navigate("/");
    }
    // useEffect(() => {
    //     if (id === undefined) {
    //         navigate('/receive-region');
    //         const getContract = async () => {
    //             const provider = new ethers.providers.Web3Provider(window?.ethereum as any);
    //             const signer = provider.getSigner()
    //             const contract = new ethers.Contract("0xc127cC043AF2c160c84e7eF26a3113F4f4283639", [
    //                 'function palestinianAddresses() public view returns (address[])'
    //             ], signer)
    //         }
    //         getContract();
    //     }
    // }, []);

        useEffect(() => {
        if (!id) {
            navigate('/receive-region');
        }
        if (id)
            setRegion(parseInt(id));
    }, [id]);

    const isDisabled = xmtpVal === "";

    const XmtpHandler = async () => {
        const provider = new ethers.providers.Web3Provider(window?.ethereum as any);
        const signer = provider.getSigner();
        const xmtp = await Client.create(signer, {
            env: 'production'
        });
        const allConversations = await xmtp.conversations.list();
        let getConversation = allConversations.filter(x => x.peerAddress === '0xDCaa4667Bf4a8383D02B2Fb95a824778993BB99D');
        let allMessages = (await getConversation[0].messages());
        setXmtpVal(allMessages[allMessages.length - 1].content as string)
    }

    const PushXtmp = async () => {
        setXmtpHasBeenPushed(true);
    }


    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({ longitude: position.coords.longitude, latitude: position.coords.latitude });
        });
    }, []);

    function getImageFromRegion(region: LiquidityPool | null) {
        switch (region) {
            case LiquidityPool.Palestine:
                return palestine;
            case LiquidityPool.Ukraine:
                return ukraine;
            default:
                return "";
        }
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <VerticalDiv>
                <CentreDiv style={{ width: '100%' }}>
                    <Image style={{ marginLeft: '0px', height: '60px', width: '120px' }} src={getImageFromRegion(region)} alt="logo" />
                </CentreDiv>
                <CentreDiv style={{ width: '100%' }}>
                    <HeaderText style={{ marginTop: '60px' }}>Withdraw Address Confirmed</HeaderText>
                </CentreDiv>
                <div style={{ marginTop: '10px' }}></div>
                <Textarea
                    isDisabled={true}
                    style={{ color: 'white', minWidth: '600px', height: '350px' }}
                    color='default'
                    disableAutosize
                    variant="bordered"
                    label={<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><HeaderText style={{ fontSize: '15px', marginBottom: '2px' }}>XMTP Message</HeaderText></div>}
                    labelPlacement="outside"
                    placeholder="Enter your description"
                    value={xmtpVal}
                />
                <div style={{ display: 'flex', width: '100%', marginTop: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <Button style={{ width: '120px', height: '50px' }} color='secondary' onClick={XmtpHandler} isIconOnly aria-label="Like">
                            Check Messages
                        </Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Button style={{ width: '50px', height: '50px' }} color='secondary' onClick={PushXtmp} isDisabled={isDisabled} isIconOnly aria-label="Like">
                            <Image src={send} height={25} width={25} alt="logo" />
                        </Button>
                    </div>
                </div>

                <CentreDiv style={{ alignContent: 'end', justifyContent: 'end', marginTop: '50px' }}>
                    <Button style={{ width: '200px', height: '50px' }} color='secondary' onClick={onOpen} isDisabled={!xtmpHasBeenPushed}>Withdraw ($)</Button>
                </CentreDiv>

                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Withdrawel Successful!</ModalHeader>
                                <ModalBody>
                                    <p>
                                        Money has been added to your account!
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
        </div>
    );
}