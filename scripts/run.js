const main = async () => {
  //Here, ⬇ we grabbed the wallet address of the contract owner (and a randomPerson)
  const [owner, randomPerson] = await hre.ethers.getSigners();

  // generate the necessary files for the smart contract under the "artifacts" directory
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  // We pass in "tlc" to the constructor when deploying. This will set Top-Level-Domain to ".tlc"
  const domainContract = await domainContractFactory.deploy("tlc");
  await domainContract.deployed();
  console.log('\x1b[31m%s\x1b[0m', "Contract deployed to:", domainContract.address);
  console.log('\x1b[32m%s\x1b[0m', "Contract deployed by:", owner.address);

  //when register this domain, for calculating the cost we add this ⬇⬇ second variable. 
  const txn = await domainContract.register("genesistwo", { value: hre.ethers.utils.parseEther('0.1') });
  //Above line ⬆⬆ will send 0.1 Matic from my wallet to the contract as payment. Once that happens, the domain will be minted to my wallet address.

  await txn.wait();



  const domainOwner = await domainContract.getAddress("genesis");
  console.log('\x1b[33m%s\x1b[0m', "Owner of domain:", domainOwner);
  // console.log('\x1b[36m%s\x1b[0m', "domainCOntractObject:", domainContract);

  // How much money is in here?
  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));


  // // Quick! Grab the funds from the contract! (as superCoder)
  // try {
  //   txn = await domainContract.connect(superCoder).withdraw();
  //   await txn.wait();
  // } catch(error){
  //   console.log("Could not rob contract");
  // }

  // Let's look in their wallet so we can compare later
  let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log('\x1b[33m%s\x1b[0m',"Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));


  try {
    let txn = await domainContract.connect(owner).withdraw();
    await txn.wait();
  } catch (error) {
    console.log("Could not rob contract", error);
  }

  // Fetch balance of contract & owner
  let contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);

  console.log('\x1b[31m%s\x1b[0m', "Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
  console.log('\x1b[32m%s\x1b[0m', "Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log('\x1b[34m%s\x1b[0m', error);
    process.exit(1);
  }
};

runMain();