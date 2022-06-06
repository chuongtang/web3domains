import React, { useState } from 'react'
import {
  VStack, Button, Input, InputGroup, InputRightElement, Tooltip, Progress, CircularProgress, CircularProgressLabel
} from '@chakra-ui/react'
import { ethers } from "ethers";


const DomainInput: React.FC = () => {

  const CONTRACT_ADDRESS: string | null = '0x0ed9ce8b8bc89ba84e494dc5c9c267db48b2d3dc';
  const [domain, setDomain] = useState<string>('');
  const [record, setRecord] = useState<string>('');

  const doLength: number = domain.length;

  // Call 'register' function from smart contract
  const mintDomain = async (): Promise<void> => {
    let price: number;
    switch (doLength) {
      case 3:
        price = 0.5;
        break;
      case 4:
        price = 0.3;
        break;
      default:
        price = 0.1;
        break;

    }

    console.log("Minting domain", domain, "with price", price);
    try {
      console.log(price)
      const winEth = (window as any).ethereum
      if (winEth) {
        const provider = new ethers.providers.Web3Provider(winEth);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);

          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();

          console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);

          setRecord('');
          setDomain('');
        }
        else {
          alert("Transaction failed! Please try again");
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <VStack color='gray.800' p={8}>
      <InputGroup size='md'>
        <Input
          variant='filled'
          value={domain}
          placeholder='Enter new domain name (at least 3 characters long)'
          onChange={e => {
            setDomain(e.target.value)
            console.log(domain)

          }} />
        <InputRightElement
          pointerEvents='none'
          color='gray.400'
          children='.web3'
          pr={8}
        />
      </InputGroup>
      <Input
        variant='filled'
        value={record}
        placeholder='what is the meaning of your domain name?'
        onChange={e => setRecord(e.target.value)} />
      <Tooltip label="All field required!" shouldWrapChildren>
        <Button colorScheme='orange' isDisabled={true && domain.length < 3 || record.length == 0} onClick={() => mintDomain()}>
          Mint
        </Button>
      </Tooltip>
      <CircularProgress isIndeterminate color='orange.400' thickness='12px' size='8rem'>
        <CircularProgressLabel color='teal'>Minting...</CircularProgressLabel>
      </CircularProgress>
      {/* <Button colorScheme='teal' isDisabled={true} onClick={null}>
        Set data
      </Button> */}


    </VStack >
  )
};

export default DomainInput;

