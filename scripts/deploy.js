const main = async () => {
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("web3");
  await domainContract.deployed();

  console.log('\x1b[31m%s\x1b[0m',"Contract deployed to:", domainContract.address);

  // register for genesis.web3 domain ⬇⬇
  let txn = await domainContract.register("genesis",  {value: hre.ethers.utils.parseEther('0.1')});
  await txn.wait();
  console.log('\x1b[32m%s\x1b[0m',"Minted domain genesis.web3");

  txn = await domainContract.setRecord("genesis", "the very first domain on dotWeb3");
  await txn.wait();
  console.log('\x1b[33m%s\x1b[0m',"Set record for genesis.web3");

  const address = await domainContract.getAddress("genesis");
  console.log('\x1b[31m%s\x1b[0m',"Owner of domain genesis:", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();