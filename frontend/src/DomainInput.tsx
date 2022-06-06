import React, { useState } from 'react'
import { VStack, Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
const DomainInput: React.FC = () => {

  const tld: string = '.web3';
  const CONTRACT_ADDRESS: string | null = 'YOUR_CONTRACT_ADDRESS_HERE';
  const [domain, setDomain] = useState<string>('');
  const [record, setRecord] = useState<string>('');

  return (
    <VStack color='white' p={8}>
      <InputGroup size='md'>
        <Input
          variant='filled'
          value={domain}
          placeholder='Enter you domain name'
          onChange={e => setDomain(e.target.value)} />
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

      <Button colorScheme='orange' disabled={null} onClick={null}>
        Mint
      </Button>
      <Button colorScheme='teal' disabled={null} onClick={null}>
        Set data
      </Button>


    </VStack>
  )
};

export default DomainInput;

