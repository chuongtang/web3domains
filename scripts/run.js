const main = async () => {
  //Here, ⬇ we grabbed the wallet address of the contract owner (and a randomPerson)
  const [owner, randomPerson] = await hre.ethers.getSigners();

  // generate the necessary files for the smart contract under the "artifacts" directory
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  // We pass in "tlc" to the constructor when deploying. This will set Top-Level-Domain to ".tlc"
  const domainContract = await domainContractFactory.deploy("tlc");
  await domainContract.deployed();
  console.log('\x1b[31m%s\x1b[0m',"Contract deployed to:", domainContract.address);
  console.log('\x1b[32m%s\x1b[0m', "Contract deployed by:", owner.address);

  //when register this domain, for calculating the cost we add this ⬇⬇ second variable. 
  const txn = await domainContract.register("genesis", {value: hre.ethers.utils.parseEther('0.1')});
  //Above line ⬆⬆ will send 0.1 Matic from my wallet to the contract as payment. Once that happens, the domain will be minted to my wallet address.

  await txn.wait();

  const domainOwner = await domainContract.getAddress("genesis");
  console.log('\x1b[33m%s\x1b[0m', "Owner of domain:", domainOwner);
  // console.log('\x1b[36m%s\x1b[0m', "domainCOntractObject:", domainContract);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m',error);
    process.exit(1);
  }
};

runMain();