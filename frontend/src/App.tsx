import { useEffect, useState, useMemo } from 'react'
import logo from './logo.svg'
import DomainInput from './components/DomainInput'
import AllMintedRecords from './components/AllMintedRecords'
import { networks } from './components/utils/networks';
import { WEB3NSpix, BuildSpaceLogo, ethLogo, polygonLogo } from '../assets'

import './App.css'
import {
  Text, Alert, AlertIcon, Heading, Button, HStack, VStack, Container, Image, Flex, Link, Spacer, Center
} from '@chakra-ui/react'

const App: React.FC = () => {
  const CONTRACT_ADDRESS: string | null = '0x719E0247E8991bc4F53d2Ee147126168aA726921';
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [network, setNetwork] = useState<string>('mangGi');
  const [isNewMint, setIsNewMint] = useState<boolean>(false);

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
      return
    }

  }, []);

  //Does the User have an Ethereum wallet/account?
  const connectWallet = async (): Promise<void> => {
    console.log("Fired")
    try {
      const accounts = await (window as any).ethereum?.request(
        { method: "eth_requestAccounts" }
      );

      // add ⬇ this guard for Firefox 
      if (accounts) {
        console.log('\x1b[31m%s\x1b[0m', "Connected to", accounts[0]);
        setCurrentAccount(accounts[0]);
      }
      // ⬇ check the user's network chain ID
      const chainId = await (window as any).ethereum?.request({ method: 'eth_chainId' });
      console.log('chainID HERE', chainId);
      // console.log('netwrosk HERE', networks);
      //@ts-ignore
      setNetwork(networks[chainId]);

      // Reload the page when they change networks
      const handleChainChanged = (_chainId: string) => {
        window.location.reload();
        console.log(network);
        // setCurrentAccount(accounts[0]);
      }

      (window as any).ethereum?.on('chainChanged', handleChainChanged);
    } catch (error: any) {
      if (error.code === -32002) {
        setMessage(`Please approve app connection in Metamask 👉`)
      } else {
        // alert(`Something went really wrong: ${error.message}`);
        console.log(error)
        setMessage('No authorized account found');
      }
      if (error.code === 4001) {
        alert(`user rejected connection`)
        // window.location.reload();
      }
    }
  };

  return (
    <div className="App">
      {message !== '' &&
        <Alert status='error'>
          <AlertIcon />
          {message}
        </Alert>}
      <header className="App-header">
        <HStack p={3} >
          <img src={logo} className="App-logo" alt="logo" />
          <Heading as='h1' size='lg'>Name Service</Heading>
          <Spacer />

          {/* Display a logo and wallet connection status*/}
          <Image alt="Network logo" boxSize='1rem'
            objectFit='cover' src={network?.includes("Polygon") ? polygonLogo : ethLogo} />
          {currentAccount ? <Text fontSize={{ base: '10px', md: '18px', lg: '26px' }}> Connected to: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </Text> : <Text fontSize={{ base: '10px', md: '20px', lg: '28px' }}>Please connect your wallet</Text>}

        </HStack>
        <Center>
          <Text m={1} borderRadius={'lg'} p={1} color='gray.500' noOfLines={1}>
            Register a domain on Polygon blockchain
          </Text>
        </Center>
      </header>
      <VStack m={6}>
        <Center m={8} >
          <Image src={WEB3NSpix} boxSize={{ base: '72px', md: '120px', lg: '180px' }} alt="main page image" />
        </Center>
        {!currentAccount && (window as any).ethereum &&
          <Button colorScheme='teal' size='lg' onClick={connectWallet}>
            Connect your wallet
          </Button>}
        {!(window as any).ethereum &&
          <Text fontSize={{ base: '14px', md: '24px', lg: '34px' }} color='tomato'>
            This app requires Metamask Wallet.{' '}
            <Link color='teal.500' href='https://metamask.io/download.html' isExternal>
              Please click here to install it
            </Link>
          </Text>}
      </VStack>
      {currentAccount && <DomainInput network={network} CONTRACT_ADDRESS={CONTRACT_ADDRESS} setIsNewMint={setIsNewMint} />}
      {currentAccount && <AllMintedRecords network={network} CONTRACT_ADDRESS={CONTRACT_ADDRESS} currentAccount={currentAccount} isNewMint={isNewMint} />}

      <Flex className="footer">
        <Link color='teal.500' href='https://buildspace.so/p/build-polygon-ens'>
          <Text as='u' fontSize={{ base: '10px', md: '16px', lg: '24px' }} color='teal'>Happily developed with buildspace</Text>
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
