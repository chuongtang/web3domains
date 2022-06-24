import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import web3Domain from './utils/web3Domain.json';
import {
  useDisclosure, Button, Slide, Box
} from '@chakra-ui/react'

type Props = {
  network: string,
  CONTRACT_ADDRESS: string,
  currentAccount: string
};

const AllMintedRecords: React.FC<Props> = ({ network, CONTRACT_ADDRESS, currentAccount }) => {

  const [mints, setMints] = useState<Array<any>>([]);
  const { isOpen, onToggle } = useDisclosure();

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

  const editRecord = (name:string) => {
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
    <div>
      <Button onClick={onToggle}>Click Me</Button>
      <Slide direction='bottom' in={isOpen} style={{ zIndex: 10 }}>
        <Box
          p='40px'
          color='white'
          mt='4'
          bg='teal.500'
          rounded='md'
          shadow='md'
        >
          Some text from minted domains here
        </Box>
        {mints.map((mint, index) => {
          return (
            <div className="mint-item" key={index}>
              <div className='mint-row'>
                <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                  <p className="underlined">{' '}{mint.name}{'.web3'}{' '}</p>
                </a>
                {/* If mint.owner is currentAccount, add an "edit" button*/}
                {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                  <button className="edit-button" onClick={() => editRecord(mint.name)}>
                    <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                  </button>
                  :
                  null
                }
              </div>
              <p> {mint.record} </p>
            </div>)
        })}
      </Slide>
    </div>
  )
}

export default AllMintedRecords