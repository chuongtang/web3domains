import { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  Text, Alert, AlertIcon, AlertTitle, AlertDescription, Heading
} from '@chakra-ui/react'
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";


// to fix "type not exist" error
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

const App = () => {

  const [message, setMessage] = useState('')
  const checkIfWalletIsConnected = () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      setMessage('Make sure you have MetaMask Installed!')
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Heading as='h1' size='4xl'>Name Service</Heading>
        {message !== '' &&
          <Alert status='error'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            >
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>}
        <Text m={3} borderRadius={'lg'} p={4} color='gray.500' bgGradient='linear(to-r, gray.300, yellow.400, pink.200)' noOfLines={1}>
          Register a domain on Polygon blockchain
        </Text>

      </header>
    </div>
  )
}

export default App
