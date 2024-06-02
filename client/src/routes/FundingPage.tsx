import { CentreDiv, SidePanel } from "./SelectionPage";
import { HeaderText } from './Root';
import { Button, Image } from "@nextui-org/react";
import palestine from '../assets/palestine.jpg'
import ukraine from '../assets/ukraine.png'
import { useState } from "react";
import SendToPool from "./components/SendToPool";

export  enum LiquidityPool {
    Palestine = 0,
    Ukraine = 1
}

export default function FundingPage() {
    const [getLiquidityPool, setLiquidityPool] = useState<LiquidityPool | null>(null);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <HeaderText style={{ textAlign: 'center', marginTop: '20px' }}>Select the region you wish to donate to</HeaderText>

            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
                <SidePanel>
                    <CentreDiv>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>

                            <Button style={{ width: '300px', height: '200px', backgroundColor: 'black' }} onClick={() => setLiquidityPool(LiquidityPool.Palestine)} isIconOnly aria-label="Like">
                                <Image style={{ marginTop: '30px' }} src={palestine} alt="logo" />
                            </Button>
                            {
                                getLiquidityPool === LiquidityPool.Palestine ?
                                    <SendToPool poolType={getLiquidityPool}/>
                                    :
                                    <div>
                                    </div>
                            }
                        </div>
                    </CentreDiv>
                </SidePanel>
                <SidePanel>
                    <CentreDiv>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Button style={{ width: '300px', height: '200px', backgroundColor: 'black' }} onClick={() => setLiquidityPool(LiquidityPool.Ukraine)} isIconOnly aria-label="Like">
                                <Image style={{ marginTop: '30px' }} src={ukraine} alt="logo" />
                            </Button>
                            {
                                getLiquidityPool === LiquidityPool.Ukraine ?
                                    <SendToPool poolType={getLiquidityPool}/>
                                    :
                                    <div>
                                    </div>
                            }
                        </div>
                    </CentreDiv>
                </SidePanel>
            </div>
        </div>
    )
}