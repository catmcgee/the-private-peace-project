import { CentreDiv } from "./SelectionPage";
import { HeaderText } from './Root';
import { Button, Image, Textarea } from "@nextui-org/react";
import send from '../assets/send.png'
import { useEffect, useState } from "react";
import { LiquidityPool } from "./FundingPage";
import { VerticalDiv } from "./components/SendToPool";
import palestine from '../assets/palestine.jpg'
import ukraine from '../assets/ukraine.png'
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from 'ethers';


interface ILocation {
    longitude: number;
    latitude: number;
}

type IParams = {
    id: string | undefined
}

export default function ReceivingPage() {
    const { id } = useParams<IParams>();
    const [getLocation, setLocation] = useState<ILocation | null>();
    const [region, setRegion] = useState<LiquidityPool | null>(LiquidityPool.Ukraine);
    const navigate = useNavigate();
    const [xtmpHasBeenPushed, setXmtpHasBeenPushed] = useState<boolean>(false);
    const [xmtpVal, setXmtpVal] = useState<string>("");


    useEffect(() => {
        if (id === undefined) {
            const getContract = async () => {
                const provider = new ethers.providers.Web3Provider(window?.ethereum as any);

                const contract = new ethers.Contract("0xc127cC043AF2c160c84e7eF26a3113F4f4283639", [
                    'function palestinianAddresses() public view returns (address[])'
                 ], provider) 
        
                const palestineAddresses: any = await contract.palestinianAddresses();
                let xx = palestineAddresses;
            }

            getContract().catch(x =>
                {
                    let cxxx :any = x;
                }
            );
        }
    }, []);

    const isDisabled = xmtpVal === "";

    const XmtpHandler = async () => {
        const provider = new ethers.providers.Web3Provider(window?.ethereum as any);
        const signer = provider.getSigner();
        const xmtp = await Client.create(signer, {
            env: 'production'
        });
        const allConversations = await xmtp.conversations.list();
        let getConversation = allConversations.filter(x => x.peerAddress === '0xaecc64a55d46551E410d3875201E9B8cd63827Eb');
        let allMessages = (await getConversation[0].messages());
        setXmtpVal(allMessages[0].content as string)
    }

    const PushXtmp = async () => {
        setXmtpHasBeenPushed(true);
    }


    // useEffect(() => {
    //     if (!id) {
    //         navigate('/receive-region');
    //     }
    //     if (id)
    //         setRegion(parseInt(id));
    // }, [id]);

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
                <div style={{ marginTop: '30px' }}></div>
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
                            Generate
                        </Button>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <Button style={{ width: '50px', height: '50px' }} color='secondary' onClick={PushXtmp} isDisabled={isDisabled} isIconOnly aria-label="Like">
                            <Image src={send} height={25} width={25} alt="logo" />
                        </Button>
                    </div>
                </div>


                <CentreDiv style={{ alignContent: 'end', justifyContent: 'end', marginTop: '150px' }}>
                    <Button style={{ width: '200px', height: '50px' }} color='secondary' isDisabled={!xtmpHasBeenPushed}>Withdraw ($)</Button>
                </CentreDiv>
            </VerticalDiv>
        </div>
    );
}