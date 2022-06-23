import { useEffect, useState, useMemo } from 'react'
import logo from './logo.svg'
import DomainInput from './components/DomainInput'
// import BGimg from '../assets/WEB3NSpix.png'
// import BuildSpacelogo from '../assets/BuildSpaceLogo.png'
import { networks } from './components/utils/networks';
import { WEB3NSpix, BuildSpaceLogo, ethLogo, polygonLogo } from '../assets'

import './App.css'
import {
  Text, Alert, AlertIcon, Heading, Button, HStack, VStack, Container, Image, Flex, Link, Spacer, Center
} from '@chakra-ui/react'
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";


// // to fix "type not exist" error
// declare global {
//   interface Window {
//     ethereum: MetaMaskInpageProvider
//   }
// }

const App: React.FC = () => {
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [network, setNetwork] = useState<string>('mangGi');

  const tld: string = '.web3';
  const CONTRACT_ADDRESS: string | null = '0x0bebB1AA19Ae44231C45b13AEd8ccd1Afd897B21';
  const [domain, setDomain] = useState<string>('');
  const [record, setRecord] = useState<string>('');


  // const { ethereum } = (window as any);
  // if (!ethereum) {
  //   console.log('Make sure you have metamask!');
  //   return;
  // } else {
  //   console.log('We have the ethereum object', ethereum);
  // };

  useEffect(() => {
    // //check if Metamask wallet is installed
    if (typeof (window as any).ethereum !== 'undefined') {
      const { ethereum } = (window as any);
      if (ethereum) {
        setIsMetamaskInstalled(true);
      } else {
        setMessage(`Please install metamask wallet \n 👉 https://metamask.io \n`)
        return
      }
    } else {
      // setMessage(`Please install metamask wallet \n 👉 https://metamask.io \n`);
      return
    }

  }, []);

  //Does the User have an Ethereum wallet/account?
  const connectWallet = useMemo(async (): Promise<void> => {
    console.log("Fired")
    try {
      const accounts = await (window as any).ethereum?.request(
        { method: "eth_requestAccounts" }
      );

      // add ⬇ this guard for Firefox 
      if (accounts){
        console.log('\x1b[31m%s\x1b[0m', "Connected to", accounts[0]);
      setCurrentAccount(accounts[0]);
      }
      

      // ⬇ check the user's network chain ID
      const chainId = await (window as any).ethereum?.request({ method: 'eth_chainId' });
      console.log('chainID HERE', chainId);
      console.log('netwrosk HERE', networks);
      //@ts-ignore
      setNetwork(networks[chainId]);

      // Reload the page when they change networks
      const handleChainChanged = (_chainId: string) => {
        window.location.reload();
        console.log(network)
      }

      (window as any).ethereum?.on('chainChanged', handleChainChanged);
    } catch (error: any) {
      if (error.code === -32002) {
        setMessage(`Please approve app connection in Metamask 👉`)
      }else{
        // alert(`Something went really wrong: ${error.message}`);
      console.log(error)
      setMessage('No authorized account found');
      }
      if (error.code === 4001){
        alert(`user rejected connection`)
        window.location.reload();
      }
    }
  }, [(window as any).ethereum])

  return (
    <div className="App">
      {message !== '' &&
        <Alert status='error'>
          <AlertIcon />
          {message}
        </Alert>}
      <header className="App-header">
        <HStack p={5} >
          <img src={logo} className="App-logo" alt="logo" />
          <Heading as='h1' size='lg'>Name Service</Heading>
          <Spacer />

          {/* Display a logo and wallet connection status*/}
          <Image alt="Network logo" boxSize='1rem'
            objectFit='cover' src={network?.includes("Polygon") ? polygonLogo : ethLogo} />
          {currentAccount ? <Text fontSize='sm'> Connected to: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </Text> : <Text fontSize='md'>Please connect your wallet</Text>}

        </HStack>
        <Center>
          <Text m={1} borderRadius={'lg'} p={4} color='gray.500' noOfLines={1}>
            Register a domain on Polygon blockchain
          </Text>
        </Center>
      </header>
      <VStack m={6}>
        <Container maxW='300px' m={8} >
          <Image src={WEB3NSpix} alt="main page image" />
        </Container>
        {!currentAccount && (window as any).ethereum &&
          <Button colorScheme='teal' size='lg' onClick={() => connectWallet}>
            Connect your wallet
          </Button>}
        {!(window as any).ethereum &&
          <Text fontSize='1.5rem' color='tomato'>
            This app requires Metamask Wallet.{' '}
            <Link color='teal.500' href='https://metamask.io/download.html' isExternal>
              Please click here to install it
            </Link>
          </Text>}
      </VStack>
      {currentAccount && <DomainInput network={network} />}

      <Flex className="footer">
        <Link color='teal.500' href='https://buildspace.so/p/build-polygon-ens'>
          <Text as='u' color='teal'>Happily developed with buildspace</Text>
        </Link>
        <Image
          borderRadius='full'
          boxSize='2rem'
          src={BuildSpaceLogo}
          alt='Buildspace logo'
          m={4}
        />
      </Flex>

    </div>
  )
}

export default App
