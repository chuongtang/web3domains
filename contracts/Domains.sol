// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

// import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import { StringUtils } from "./libraries/StringUtils.sol";

// import another help function: convert SVG and JSON to Base64 in Solidity
import {Base64} from "./libraries/Base64.sol";

import "hardhat/console.sol";

// We inherit the contract we imported. This means we'll have access
// to the inherited contract's methods.
contract Domains is ERC721URIStorage {

     // OpenZeppelin helps us keep track of tokenIds.
  using Counters for Counters.Counter;

  //_tokenIds to keep track of the NFTs unique identifier. 
  //It's automatically initialized to 0 when we declare private _tokenIds.
  //_tokenIds is a state variable which means if we change it, 
  //the value is stored on the contract directly (like tokenId++)
  Counters.Counter private _tokenIds;

    // Here's the TLD (top-level domain)
  string public tld;

   // We'll be storing our NFT images on chain as SVGs
  string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#a)" d="M0 0h270v270H0z"/><defs><filter id="b" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949a4.382 4.382 0 0 0-4.394 0l-10.081 6.032-6.85 3.934-10.081 6.032a4.382 4.382 0 0 1-4.394 0l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616 4.54 4.54 0 0 1-.608-2.187v-9.31a4.27 4.27 0 0 1 .572-2.208 4.25 4.25 0 0 1 1.625-1.595l7.884-4.59a4.382 4.382 0 0 1 4.394 0l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616 4.54 4.54 0 0 1 .608 2.187v6.032l6.85-4.065v-6.032a4.27 4.27 0 0 0-.572-2.208 4.25 4.25 0 0 0-1.625-1.595L41.456 24.59a4.382 4.382 0 0 0-4.394 0l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595 4.273 4.273 0 0 0-.572 2.208v17.441a4.27 4.27 0 0 0 .572 2.208 4.25 4.25 0 0 0 1.625 1.595l14.864 8.655a4.382 4.382 0 0 0 4.394 0l10.081-5.901 6.85-4.065 10.081-5.901a4.382 4.382 0 0 1 4.394 0l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616 4.54 4.54 0 0 1 .608 2.187v9.311a4.27 4.27 0 0 1-.572 2.208 4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721a4.382 4.382 0 0 1-4.394 0l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616 4.53 4.53 0 0 1-.608-2.187v-6.032l-6.85 4.065v6.032a4.27 4.27 0 0 0 .572 2.208 4.25 4.25 0 0 0 1.625 1.595l14.864 8.655a4.382 4.382 0 0 0 4.394 0l14.864-8.655a4.545 4.545 0 0 0 2.198-3.803V55.538a4.27 4.27 0 0 0-.572-2.208 4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#eae2b7"/><defs><linearGradient id="a" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#e76f51"/><stop offset="1" stop-color="#2a9d8f" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fcbf49" filter="url(#b)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
  string svgPartTwo = '</text></svg>';

   // A mapping is a simple data type that “maps” two values to store their names (we’re matching a string (domain name) to a wallet address.)
  mapping(string => address) public domains; 

  // This new mapping values (These values can be anything - wallet addresses, secret encrypted messages, Spotify links, the IP address to our servers, whatever you want!)
  mapping(string => string) public records;

   // Inherit from ERC721 contract for NFT: collection name ⬇⬇ & NFT symbol ⬇⬇
  constructor(string memory _tld) payable ERC721("TLC Name Service", "TNS") {
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }

 // This function will give us the price of a domain based on length
    //"pure" meaning it doesn’t read or modify ⬇⬇ contract state.
  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
  }


  // A register function that adds their names to our mapping
  function register(string calldata name) public payable {
      // 'calldata' - this ⬆  indicates the “location” of where the name argument should be stored. Since it costs real money to process data on the blockchain, Solidity lets you indicate where reference types should be stored. calldata is non-persistent and can’t be modified. We like this because it takes the least amount of gas!

      // Ensure name is unregistered. ⬇ address(0) in Solidity is sort of like the void 
    require(domains[name] == address(0));

    uint256 _price = price(name);

    // Check if enough Matic was paid in the transaction:  “Value” is the amount of Matic sent and “msg” is the transaction
    require(msg.value >= _price, "Not enough Matic paid");

       // Combine the name passed into the function  with the TLD
    string memory _name = string(abi.encodePacked(name, ".", tld));


    // Create the SVG (image) for the NFT with the name.
    //strings in Solidity are weird? Well, they can’t be combined directly. 
    //Instead, we have to use the "encodePacked" ⬇⬇ function to turn a bunch of strings into bytes and then combines them!
    string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
    uint256 newRecordId = _tokenIds.current();
    uint256 length = StringUtils.strlen(name);
    string memory strLen = Strings.toString(length);

    console.log("Registering %s.%s on the contract with tokenID %d", name, tld, newRecordId);

    // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name": "',
        _name,
        '", "description": "A domain on the TLC name service", "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(finalSvg)),
        '","length":"',
        strLen,
        '"}'
      )
    );

    string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));

    console.log("\n--------------------------------------------------------");
    console.log("Final tokenURI **> ", finalTokenUri);
    console.log("--------------------------------------------------------\n");

    // Mint the NFT to newRecordId
    _safeMint(msg.sender, newRecordId);

    // Set the NFTs data -- in this case the JSON blob w/ our domain's info!
    _setTokenURI(newRecordId, finalTokenUri);

    domains[name] = msg.sender;

    _tokenIds.increment();
  }

  //     // This "%S" ⬇ will log current wallet
  // console.log("%s has registered a domain!", msg.sender);
  // }

  // This will give us the domain owners' address
  function getAddress(string calldata name) public view returns (address) {
      return domains[name];
  }
  function setRecord(string calldata name, string calldata record) public {
      // Check that the owner is the transaction sender
      require(domains[name] == msg.sender);
      records[name] = record;
      console.log("%s recording!", record);
  }

  function getRecord(string calldata name) public view returns(string memory) {
      return records[name];
  }
}