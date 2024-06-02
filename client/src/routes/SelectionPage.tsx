import styled from 'styled-components'
import { HeaderText } from './Root';
import { Image } from "@nextui-org/image";
import donate from '../assets/donate.png'
import receive from '../assets/receive.png'

import { Button } from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';

export const CentreDiv = styled.div`
    display: flex;
    justify-content:center;
    align-items: center;
`
export const SidePanel = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    width: 100%;
`

export default function SelectionPage() {

    const navigate = useNavigate();

    const moveToPage = (value: string) => {
        navigate("/" + value);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <SidePanel style={{borderLeft: '1px solid white', borderRight: '1px solid white'}}>
                <CentreDiv style={{ width: '100%', borderBottom: '1px solid white', marginTop:'20px'}}>
                    <HeaderText style={{  marginTop: '10px' }}>Funder</HeaderText>
                </CentreDiv>
                <HeaderText style={{ textAlign: 'center', marginTop: '40px' }}>A founder is able to donate money to the people that really need it. You can rest assured that whenever you want to donate that the person receiving those funds are in need.</HeaderText>
                <CentreDiv style={{ marginTop: '120px' }}>
                    <Button style={{ width: '200px', height: '200px' }} onClick={() => moveToPage('funding')} isIconOnly color="secondary" aria-label="Like">
                        <Image style={{ marginTop: '30px' }} src={donate} alt="logo" />
                    </Button>
                </CentreDiv>
            </SidePanel>
            <SidePanel>
                <CentreDiv style={{ width: '100%', borderBottom: '1px solid white', marginTop:'20px' }}>
                    <HeaderText style={{ textAlign: 'center', marginTop: '10px' }}>Receiver</HeaderText>
                </CentreDiv >
                <HeaderText style={{ textAlign: 'center', marginTop: '40px' }}>If you are someone from Ukraine / Palestine and are in need of funds, you are able to access funds generously denoted by anonymous users arround the world.</HeaderText>
                <CentreDiv style={{ marginTop: '120px' }}>
                    <Button style={{ width: '200px', height: '200px' }} isIconOnly onClick={() => moveToPage('receive/')} color="secondary" aria-label="Like">
                        <Image style={{ marginTop: '30px' }} src={receive} alt="logo" />
                    </Button>
                </CentreDiv>
            </SidePanel>
        </div>
    )
}