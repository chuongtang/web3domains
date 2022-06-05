import { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  Text, Alert, AlertIcon, Heading, Button
} from '@chakra-ui/react'
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";


// to fix "type not exist" error
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}

const App: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [message, setMessage] = useState('')

  const checkIfWalletIsConnected = async () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      setMessage('Make sure you have MetaMask Installed!')
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    let accounts : (string | number)[] =  await ethereum.request({ method: 'eth_accounts' });

    // Users can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      let account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  };


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // Connect wallet to app
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif" alt="Ninja gif" />
      <Button colorScheme='orange'>Connect your wallet</Button>
    </div>
  );

  return (
    <div className="App">
      {message !== '' &&
        <Alert status='error'>
          <AlertIcon />
          {message}
        </Alert>}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Heading as='h1' size='4xl'>Name Service</Heading>
        <Text m={3} borderRadius={'lg'} p={4} color='gray.500' bgGradient='linear(to-r, gray.300, yellow.400, pink.200)' noOfLines={1}>
          Register a domain on Polygon blockchain
        </Text>

      </header>
    </div>
  )
}

export default App
