import { useEffect, useState } from 'react'
import logo from './logo.svg'
import DomainInput from './components/DomainInput'
import BGimg from '../assets/WEB3NSpix.png'
import BSpacelogo from '../assets/BuildSpaceLogo.png'

import './App.css'
import {
  Text, Alert, AlertIcon, Heading, Button, HStack, VStack, Container, Image, Flex, Link
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

  const tld: string = '.web3';
  const CONTRACT_ADDRESS: string | null = '0x0bebB1AA19Ae44231C45b13AEd8ccd1Afd897B21';
  const [domain, setDomain] = useState<string>('');
  const [record, setRecord] = useState<string>('');


  useEffect(() => {
    //check if Metamask wallet is installed
    ((window as any).ethereum)
      ? setIsMetamaskInstalled(true)
      : setMessage(`Please install metamask wallet \n 👉 https://metamask.io \n`)
  }, []);

  //Does the User have an Ethereum wallet/account?
  const connectWallet = async (): Promise<void> => {
    console.log("Fired")
    try {
      const accounts = await (window as any).ethereum.request(
        { method: "eth_requestAccounts" }
      );
      console.log('\x1b[31m%s\x1b[0m', "Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error: any) {
      alert(`Something went wrong: ${error}`);
      setMessage('No authorized account found');
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
        <HStack>
          <img src={logo} className="App-logo" alt="logo" />
          <Heading as='h1' size='lg'>Name Service</Heading>
        </HStack>
        <Text m={1} borderRadius={'lg'} p={4} color='gray.500' noOfLines={1}>
          Register a domain on Polygon blockchain
        </Text>
      </header>
      <VStack m={6}>
        <Container maxW='300px' m={8} >
          <Image src={BGimg} alt="main page image" />
        </Container>
        {!currentAccount &&
          <Button colorScheme='teal' size='lg' onClick={connectWallet}>
            Connect your wallet
          </Button>}
        {currentAccount && <Text color='teal.500' noOfLines={2} fontSize='1rem'>
          App connected to:<strong> {currentAccount}</strong>
        </Text>}
      </VStack>
      {currentAccount && <DomainInput />}

      <Flex className="footer">
        <Link color='teal.500' href='https://buildspace.so/p/build-polygon-ens'>
          <Text as='u' color='teal'>Happily developed with buildspace</Text>
        </Link>
        <Image
          borderRadius='full'
          boxSize='2rem'
          src={BSpacelogo}
          alt='Buildspace logo'
          m={4}
        />
      </Flex>

    </div>
  )
}

export default App
