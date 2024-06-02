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
import { PrimeSdk, EtherspotBundler, ArkaPaymaster} from '@etherspot/prime-sdk';


interface ILocation {
    longitude: number;
    latitude: number;
}

type IParams = {
    id: string | undefined
}

// dummy eoa used to sponsor transactions as smart contract wallet owner
const eoaPrivateKey = '0xafdfd9c3d2095ef696594f6cedcae59e72dcd697e2a7521b1578140422a4f890';
const bundlerApiKey = 'eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6IjMxMDZiOGY2NTRhZTRhZTM4MGVjYjJiN2Q2NDMzMjM4IiwiaCI6Im11cm11cjEyOCJ9';


const addAddress = async () => {

 // generateRandomEOA();
const proof = "0x2b363adafeb6b763ee23045719779a2ee822afddf41a18f3b0508851fff95b63007946eacf90cdc817e3a6104d684ad444da949973282a75edce4f89a0703e4915ea627cbc924501a1282411c72f79f65391ca635452fb0502864b98a933251b18a77d34f0808c778f2d729a8783cb3db0fb76cd1d0124b95472e7e57753d14c1d99fe0dd9f63c51e35cf606165bdb9945442fb3ea43ffff5d6fd4022c064d762e04b8186b1ecf2ce48cfcfa0ce674b45e8c1e6815958c5ccbee8919da023cdd18e005a9eeff3e7c87b3a3d5950f5f240c71d73578cb0760aecd50e3bc1538fe0c8114c9444904b29b9fba02238fff79a7f02cb7aad56bbbef09530df620655f2b3f46715cf1bbafebb51711c1e001a7ee60a35f3634e1bf4e4c57dbe145a7a42c6a453b30ad0c10d03f59aad706d59a34a65cd5371ec718d7ad322c651f38832c0bdfb5ab2560735e6d66c40d370b2123362f87bb249b32d0687125f273e549236ed8ee642968e35bafb7be121472a6d0743d638be60c38be02c106b1ddae361a2f837756ada7eb62ff5e7d9e05455ac2123a825c17a831c1ed27258d9b5052105e058eabb4d6c2cc26893b49272b6ba5489dcb408a5afaaf3bfba8679799520d3982973080e885ad733ae198b667ec3c4ee832f3b6f39398682bdc4037a4352bcc2592f85c45b14a89b6fa48f17263fe210c376248b9120ab7a4ba9f378837236c767884e626d9aa6abdc2a87ff764e24257c963582fa73833493514b7b5f013e379b53b95642f83a1f7cd35f170a9c78289b8a24fa8af5800e035e2c363c82726f9443679d30e2274b67353a75ca395327d4ceaf65c2c75147e437c80eb0e097c91266cfdd2072aecffa617c53d7d997f7cc278293759533488524b679e110aa6a950483ddd5d5542c4a7a8e9edc3e207e0bb478067519a780b78ea884b8e1c15db0408ffd51c126044cb8af1050051bd6a5f202ec69bf8cee29e431f951708a5f379ac6e22b7b03f2752e8255856ce0ba54c0a65dcde0f0758fe91e8e590020f80c1cc3f30e7bb8f374cea00d17c1109d059a65ed062bb8db7ccb47ffa8b143b9a10715bfb71bda57d7201cb2c61e41bc2cbf438620c4b4dcbb29c5ba64d1678778f5b399e3df6438d9746341b1f9c4b3c8c855a7ada956b60653c6c6c3b2cb41611a6cddad867f2527557c14479467447857607dace170964390814e9570b65573d5e1a9cf4eab48f183ee3aeed94d6e7c4b1acec04fb8d5261d2832f4c0b75fe920375fbf09848527d82717f1511a23f7438209af9c146dabf7203f0f60c845a0d3d29fee3283b7aa2ce6c054971e5e6800cb4be0b8e8c8770d76016960597df590a99fa223e39766abef592a2e8dd3640824505e28ddba5d0f74ebcaa1f2ffe68bdd948bfa9eff6e0af73a37a372e77f4dfb2ffa3d3438a0f2d226bd50863cf058fe6f7335d5631a01e705bf45d4bd160c36788d3d4c978b972f61aff19981f0fb33f4e9d6bb68075f07e10d74e5141b45d6df9c14567e43e35d3af2b2b59573857a71d05676361a68bc78f8ac58520105f13053f25382d805fd887b1121c396647c3f9056674f10d8d6197ec5ac31cc08ef9c3ee1c682d41ceaed3400b2fbeb21533f4447c72ecd57deb2545d1ba6c81048a0bc51bb74ba1ee9d795424c7ddc1c87342e1e8296d4b6e69361d200bae3561f80586611f2fe02471287f0dfbae5e9a80f1559b8fa80add65ee97462907a145ac8eb662a51e8a6a44d7a929b6cdc5bf4c39f608f803870a308a1efbd669cb4f33dcce8fa9bfbb03f023862d85ac9dc671afa1048a4d0c5ba8d3fd7d6e9458ba117c71df5a215543d997ab0bf864d611fddc97ecca7894dc41cad06cde251129174d0829a634eee108c5a20ad6860f2b3548b6cef90da4c5168f19bb7f4f796fbd0ddadfee60f1a713740d10c79e0b1fcdee66baac63403ce0b7e8ba97a2c186cf11a7a992f172e5ec35fe2a5fbd1ad30d3d042662e3b62d5ec8c008e8e475e43d0b68eefad5b11bbfe52913938db7a51aeb77d9c91e759c5b813a2f063de1c7f19498f080c45b619394532d2bacc7585a3a15457f9eeb8cd992117d577f96255f8e5a35e8a8999767437e2793cd6e4dc03ff307462880cde3ff6e947a4955a31a8877a80d02c8a01886d40633bac44894075107dd15ee4bad8761bcddf8ca8b789008c2e84833341bc1d71ee007b010d11932c495643df60493d23eac66fd1f5a24736241a983a4f3ab870f081f785dea8dc16c099ce1799a8fbba8a985d852c3fd0e534c0de94935911f199a31ca3dc495689cc342a578c9e11520ce6d8874d8e4a8ec7e63d37d69294f1535be47facb40eef4583188ccc16da1aa08671db42b4591aacdf8f9086de1dd2b6ad50192037484771e1f813a2297b3af707110cd8380a967ce2706c7d444d80a911cbc7eb8c2445abf029737d569c89b10f0d518958e3c4be019d12e3747d4301cf364e6ee875fc20d1721d0d1f4471a6e6248f22f42e9d6159c69161ea1e225ff93d4b64f81116e146a7093ae2ad6118630f8257e241e46d6fa3102f5b1151de7abb69dfcae4b98f81425ca3fd6c4a806b0cb72a5a69c7605d9a6b284811414c35a9b139ac9cb1feb7b00f3c852a6f075b5d7401da913da515a92ad6a1e5718991ce55900ae5db0b5a68c1bdfec9371622170991099c64d33815e5e0509ef0e8ccbb112c9aa3066b0b854d32794ddc61d54d287639fc7d7ff4ec13f30201804807a7ccc92a6031cabca1d8a6f3d281ad8883475b6a5c962cb1c24205b36412ad877bb678d41ff8af7219cc3383dcf97c7a3deddc31c5c3178df1af1864c6b24f53011c59bc9ea095ea4bab8e3d5975f5be250030616838f6ad708653daba80fb0dda729d2887900d49862a53fe64924d4d62a1070c114dc218ca49755de6917ca54caa60699510c614239fe6606d4ee694a67af2f101c9ddd5c19636bcdbc1e68a5231cbdaa80468d22d2c364b3218f06a7e127536e9fae42cbe7ff1e7c1e"

  const primeSdk = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 11155111, bundlerProvider: new EtherspotBundler(11155111, bundlerApiKey) });
  // clear the transaction batch
  await  primeSdk.clearUserOpsFromBatch();

  // define etherspot variables
  const arka_api_key = 'arka_public_key';
  const arka_url = 'https://arka.etherspot.io';
  const arkaPaymaster = new ArkaPaymaster(11155111, arka_api_key, arka_url);

  const check = await arkaPaymaster.checkWhitelist(await primeSdk.getCounterFactualAddress());
  if(!check)
  console.log(await arkaPaymaster.addWhitelist([await primeSdk.getCounterFactualAddress()]))

  // get contract interface
  const pppInterface = new ethers.utils.Interface([
    "function addAddress(bool receiverType, address receiver, bytes proof)",
  ]);

  const addAddressData = pppInterface.encodeFunctionData("addAddress", [0, "0xA4831B989972605A62141a667578d742927Cbef9", proof]);

  await primeSdk.addUserOpsToBatch({
    to: "0x58D2D174483ac0b236116BD381BBcC3A5d83b457",
    data: addAddressData,
  });


  // Add paymaster data to the userop when estimating
  
  const estimation = await primeSdk.estimate({
    paymasterDetails: {
      url: `https://arka.etherspot.io?apiKey=arka_public_key&chainId=11155111`,
      context: { mode: "sponsor" },
    },
  });

  
  console.log(estimation)

  const uoHash = await primeSdk.send(estimation);
  console.log(`UserOpHash: ${uoHash}`);
}

const withdrawFunds = async () => {


  const primeSdk = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 11155111, bundlerProvider: new EtherspotBundler(11155111, bundlerApiKey) });
  // clear the transaction batch
  await  primeSdk.clearUserOpsFromBatch();

  const arka_api_key = 'arka_public_key';
  const arka_url = 'https://arka.etherspot.io';
  const arkaPaymaster = new ArkaPaymaster(11155111, arka_api_key, arka_url);
  console.log(await arkaPaymaster.addWhitelist([await primeSdk.getCounterFactualAddress()]))

  // Add paymaster data to the userop when estimating
  const estimation = await primeSdk.estimate({
    paymasterDetails: {
      url: `https://arka.etherspot.io?apiKey=arka_public_key&chainId=11155111`,
      context: { mode: "sponsor" },
    },
  });
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