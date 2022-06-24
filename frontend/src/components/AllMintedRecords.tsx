import React, { useState, useEffect, useRef } from 'react';
import { ethers } from "ethers";
import web3Domain from './utils/web3Domain.json';
import {
  useDisclosure, Button, Text, Box, SimpleGrid, Link, RadioGroup, Radio, Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react'

type Props = {
  network: string,
  CONTRACT_ADDRESS: string,
  currentAccount: string
};

const AllMintedRecords: React.FC<Props> = ({ network, CONTRACT_ADDRESS, currentAccount }) => {

  const [mints, setMints] = useState<Array<any>>([]);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [scrollBehavior, setScrollBehavior] = useState('inside')

  const btnRef = React.useRef(null)

  const fetchMints = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, web3Domain.abi, signer);

        // Get all the domain names from our contract
        const names = await contract.getAllNames();

        // For each name, get the record and the address
        const mintRecords = await Promise.all(names.map(async (name: string) => {
          const mintRecord = await contract.records(name);
          const owner = await contract.domains(name);
          return {
            id: names.indexOf(name),
            name: name,
            record: mintRecord,
            owner: owner,
          };
        }));

        console.log("MINTS FETCHED ", mintRecords);
        setMints(mintRecords);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateDomain = async () => {
    if (!record || !domain) { return }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

        fetchMints();
        setRecord('');
        setDomain('');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }
  const editRecord = (name: string) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  }
  // This will run any time currentAccount or network are changed
  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
      fetchMints();
    }
  }, [currentAccount, network]);
  return (
    <>
      <Button mt={3} ref={btnRef} onClick={onOpen}>
        Minted List
      </Button>

      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior={'inside'}

      >
        <ModalOverlay />
        <ModalContent bgGradient='linear(to-r, gray.300, yellow.400, pink.200)'>
          <ModalHeader color={'teal'}>Recently Minted Domains</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {mints.map((mint, index) => {
              return (
                <SimpleGrid minChildWidth='30px' spacing='40px' columns={{ sm: 2, md: 3, lg: 4 }}>
                  <Box key={mint.index} height='80px' as='button' borderRadius='md' border='1px' borderColor='gray.400' mb={2}>
                    <Link key={mint.index + `link`} href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer" fontSize={{ base: '12px', md: '18px', lg: '24px' }} >
                      {' '}{mint.name}{'.web3'}{' '}
                    </Link>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                      <Button colorScheme='teal' variant='ghost' p={1} onClick={() => editRecord(mint.name)} alignItems='start'
                        justifyContent='start' >
                        <svg width="18" height="18" viewBox="0 0 21 21">
                          <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(3 3)">
                            <path d="m7 1.5h-4.5c-1.1045695 0-2 .8954305-2 2v9.0003682c0 1.1045695.8954305 2 2 2h10c1.1045695 0 2-.8954305 2-2v-4.5003682" />
                            <path d="M14.5.46667982c.5549155.5734054.5474396 1.48588056-.0167966 2.05011677l-6.9832034 6.98320341-3 1 1-3 6.9874295-7.04563515c.5136195-.5178979 1.3296676-.55351813 1.8848509-.1045243zM12.5 2.5l.953 1" />
                          </g>
                        </svg>

                      </Button>
                      :
                      null
                    }
                    <Text fontSize={{ base: '12px', md: '18px', lg: '22px' }}> {mint.record} </Text>
                  </Box>
                </SimpleGrid>)
            })}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AllMintedRecords