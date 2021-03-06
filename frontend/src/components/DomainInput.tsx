import React, { useState, Dispatch } from 'react'
import {
  VStack, Button, Input, InputGroup, InputRightAddon, Center, Tooltip, Link, CircularProgress, CircularProgressLabel, Alert, AlertIcon, AlertTitle, AlertDescription, Text
} from '@chakra-ui/react'
import { ethers } from "ethers";
import web3Domain from './utils/web3Domain.json'

type Props = {
  network: string,
  CONTRACT_ADDRESS: string,
  setIsNewMint: Dispatch<React.SetStateAction<boolean>>,
};

const DomainInput: React.FC<Props> = ({ network, CONTRACT_ADDRESS, setIsNewMint }) => {

  // const CONTRACT_ADDRESS: string | null = '0xd4E97d0E516E543B711c372b4bFEc8dF45066795';
  const [domain, setDomain] = useState<string>('');
  const [record, setRecord] = useState<string>('');
  const [recordString, setRecordString] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [aMinting, setAMinting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const { ethereum } = (window as any);
  const doLength: number = domain.length;

  const switchNetwork = async () => {
    const addMumbaiNetwork = async () => {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x13881',
              chainName: 'Polygon Mumbai Testnet',
              rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
              nativeCurrency: {
                name: "Mumbai Matic",
                symbol: "MATIC",
                decimals: 18
              },
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    }
    console.log((window as any).ethereum.networkVersion, 'window.ethereum.networkVersion');
    if (ethereum) {
      try {
        await addMumbaiNetwork()
        // Try to switch to the Mumbai testnet
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
        });
        console.log('Wallet switched!!!!')
      } catch (error: unknown) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask.

        if (error instanceof Error) {
          //@ts-ignore
          (error.code === 4902) ? addMumbaiNetwork() : alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        } else {
          console.log('Unexpected error', error);
        }
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  // If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
  if (network !== 'Polygon Mumbai Testnet') {
    return (
      <VStack>
        <Alert status='warning' flexDirection='column' width='50%' borderRadius="xl"
          alignItems='center' mb={12}>
          <AlertIcon />
          Please connect to Polygon Mumbai Testnet
        </Alert>
        <Button colorScheme='teal' bgGradient="linear(to-r, green.100, pink.100)" variant='outline' onClick={switchNetwork}>Click to switch ????</Button>
      </VStack>
    );
  }

  // Call 'register' function from smart contract
  const mintDomain = async (): Promise<void> => {
    let price: string;
    switch (doLength) {
      case 3:
        price = "0.5";
        break;
      case 4:
        price = "0.3";
        break;
      default:
        price = "0.1";
        break;

    }

    console.log("Minting domain", domain, "with price", price);
    setAMinting(true);
    setAlertMsg(`.web3 domain is being minted on the blockchain`);
    setTimeout(() =>
      setAlertMsg(''), 3000);
    try {
      console.log(price)
      const winEth = (window as any).ethereum
      if (winEth) {
        const provider = new ethers.providers.Web3Provider(winEth);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, web3Domain.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        setAlertMsg(`Minting started, please approve gas in Metamask`)
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);
          setAlertMsg('');
          setSuccessMsg(`Domain minted! https://mumbai.polygonscan.com/tx/${tx.hash}`)

          setAlertMsg('Setting domain record on Polygon network');
          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          setSuccessMsg('');
          await tx.wait();

          console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);
          setRecordString(`https://mumbai.polygonscan.com/tx/${tx.hash}`);
          setAlertMsg('');
          setRecord('');
          setDomain('');
          setAMinting(false);
          setSuccessMsg(`Record set at https://mumbai.polygonscan.com/tx/${tx.hash}`)
          setTimeout(() => setSuccessMsg(''), 5000);
          setIsNewMint(true)
        }
        else {
          alert("Transaction failed! Please try again");
          setError("Transaction failed! Please try again");
          setTimeout(() => setError(''), 5000)
        }
      }
    }
    catch (error) {
      console.log(error);
      //@ts-ignore
      (error.data)? setError(error.data.message): setError(error.message);
      // setError(error.data.message);
      setAMinting(false);
      setTimeout(() => setError(''), 5000)
      setRecord('');
      setDomain('');
    }
    setIsNewMint(true)
  }



  return (
    <VStack color='gray.800' p={2}>
      {recordString &&
        <>
          <Text fontSize='1rem' color='tomato' m={2}>
            Check domain record on PolygonScan.  {' '}
            <Link color='teal.500' href={recordString} isExternal>
              Click here
            </Link>
          </Text>
          <Button colorScheme='teal' variant='solid' mt={4} onClick={() => setRecordString('')}>
            Mint another '.web3' domain
          </Button>
        </>}
      {
        alertMsg && <Alert status='warning'>
          <AlertIcon />
          <AlertTitle color='teal'>{`${domain}.web3`}</AlertTitle>
          <AlertDescription > {alertMsg} </AlertDescription>
        </Alert>
      }
      {
        error && <Alert status='error'>
          <AlertIcon />
          <AlertTitle color='teal'>{error}</AlertTitle>
        </Alert>
      }
      {
        successMsg && <Alert status='success'>
          <AlertIcon />
          <AlertTitle color='teal'>{successMsg}</AlertTitle>
        </Alert>
      }
      {recordString === '' &&
        <>
          <InputGroup size='md'>
            <Input
              variant='filled'
              value={domain}
              placeholder='Enter 3 to 8 characters domain name'
              onChange={e => {
                setDomain(e.target.value)
              }} />
            <InputRightAddon
              pointerEvents='none'
              color='teal.500'
              children='.web3'
              pr={8}
            />
          </InputGroup>
          <Input
            variant='filled'
            value={record}
            placeholder='what is the meaning of your domain name?'
            onChange={e => setRecord(e.target.value)} />
        </>
      }
      {
        !aMinting ? (<Tooltip label="Mint new domain? All field required!" shouldWrapChildren>
          <Button colorScheme='orange' isDisabled={true && domain.length < 3 || record.length == 0} onClick={() => mintDomain()}>
            Mint
          </Button>
        </Tooltip>) : (
          <CircularProgress isIndeterminate color='orange.400' thickness='12px' size='8rem'>
            <CircularProgressLabel color='teal'>Minting...</CircularProgressLabel>
          </CircularProgress>)
      }
    </VStack >
  )
};

export default DomainInput;

