import React, { useState, useEffect, useRef } from 'react';
import { ethers } from "ethers";
import web3Domain from './utils/web3Domain.json';
import {
  useDisclosure, Button, Text, Box, SimpleGrid, Link, IconButton, Spacer, Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Flex
} from '@chakra-ui/react'
import { ExternalLinkIcon, EditIcon } from '@chakra-ui/icons'

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
    // setEditing(true);
    // setDomain(name);
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
                  <Box key={mint.index} height='80px'  borderRadius='md' border='1px' borderColor='gray.400' mb={2} p={2}>
                    <Flex>
                      <Link key={mint.index + `link`} href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer" fontSize={{ base: '12px', md: '16px', lg: '20px' }} >
                        {' '}{mint.name}{'.web3'}{' '}<ExternalLinkIcon w={3} h={3} color="teal" />
                      </Link>
                      <Spacer />
                      {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                        <IconButton
                          colorScheme='teal'
                          variant='unstyled'
                          aria-label='Edit record'
                          size='sm'
                          icon={<EditIcon />}
                          p={0}
                          onClick={()=>editRecord(mint.name)}
                        /> : null}
                    </Flex>
                    <Text as='i' fontSize={{ base: '12px', md: '16px', lg: '20px' }}> "{mint.record}" </Text>
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