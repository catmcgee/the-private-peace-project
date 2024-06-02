import { CentreDiv, SidePanel } from "./SelectionPage";
import { Button, Image } from "@nextui-org/react";
import palestine from '../assets/palestine.jpg'
import ukraine from '../assets/ukraine.png'
import { useNavigate } from "react-router-dom";
import { LiquidityPool } from "./FundingPage";
import { HeaderText } from "./Root";

export default function ReceivingRegionPage() {
    const navigate = useNavigate();
    return (
        <div style={{width:'100%'}}>
            <CentreDiv style={{marginTop:'20px'}}>
                <HeaderText>Select the region you wish to claim from.</HeaderText>
            </CentreDiv>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginTop:'260px' }}>
                <SidePanel>
                    <CentreDiv>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Button style={{ width: '300px', height: '200px', backgroundColor: 'black' }} onClick={() => navigate("/receive/" + LiquidityPool.Palestine)} isIconOnly aria-label="Like">
                                <Image style={{ marginTop: '30px' }} src={palestine} alt="logo" />
                            </Button>
                        </div>
                    </CentreDiv>
                </SidePanel>
                <SidePanel>
                    <CentreDiv>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Button style={{ width: '300px', height: '200px', backgroundColor: 'black' }} onClick={() => navigate("/receive/" + LiquidityPool.Ukraine)} isIconOnly aria-label="Like">
                                <Image style={{ marginTop: '30px' }} src={ukraine} alt="logo" />
                            </Button>
                        </div>
                    </CentreDiv>
                </SidePanel>
            </div>
        </div>

    )
}