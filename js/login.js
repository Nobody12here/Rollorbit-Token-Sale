import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { disconnect, getAccount, waitForTransaction } from '@wagmi/core'
import { sepolia, mainnet, arbitrum } from 'viem/chains';
import { readContract, writeContract } from '@wagmi/core'
import { erc20ABI } from '@wagmi/core'
import presaleABI from '../abi/presaleABI.js';

const projectId = 'eb79a9946b4e4b2ae10c8531e04aac3f'
const presaleAddress = '0x34d4cd28C6c3d310C5FB6F7B110339b15F503AA0';
const TokenAddress = '0x6786a1091e78C3C2Ae1fC789ebab5c575e0c6847';
const tokenPrice = 410000000000000;

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal RollarBit',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [sepolia]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
const modal = createWeb3Modal({ wagmiConfig, projectId, chains })
function connect() {
  const buttons = document.getElementsByClassName("wallet-connect");
  if (getAccount().isConnected) {
    disconnect()
    
    for (let index = 0; index < buttons .length; index++) {
      const btn = buttons[index];
      btn.innerText = "Connect Wallet";
    }
    
  } else {
    modal.open()
    for (let index = 0; index < buttons .length; index++) {
      const btn = buttons[index];
      btn.innerText = "Wallet Connected";
    }
  }
}

const connectWalletBtns = document.getElementsByClassName('wallet-connect')

for (let index = 0; index < connectWalletBtns.length; index++) {
  connectWalletBtns[index].addEventListener('click', ()=>{connect()});

}
function BNBPriceCalculation(tokenAmount) {

  const weiValue = BigInt(tokenAmount * tokenPrice);
  return weiValue;
}
function updateBNBAmount() {
  const BNBAmountField = document.getElementById('bnb-amount');
  const tokenAmount = parseFloat(tokenAmountField.value) || 0; // Get the token amount from the input field
  // Calculate the weiValue based on the tokenAmount and tokenPrice
  const weiValue = tokenAmount * tokenPrice;
  // Display the weiValue in the bnb-amount field
  BNBAmountField.value = weiValue / 10 ** 18;
}
function updateSellBNBAmount() {
  const BNBAmountField = document.getElementById('sell-bnb-amount');
  const tokenAmount = parseFloat(sellTokenAmountField.value) || 0; // Get the token amount from the input field
  // Calculate the weiValue based on the tokenAmount and tokenPrice
  const weiValue = tokenAmount * tokenPrice;
  // Display the weiValue in the bnb-amount field
  BNBAmountField.value = weiValue / 10 ** 18;
}

async function handlePurchaseClick() {
  const tokenAmount = document.getElementById('token-amount').value;
  try {
    toggleSpinner();
    const hash = await writeContract({
      abi: presaleABI,
      address: presaleAddress,
      functionName: "purchaseToken",
      value: BNBPriceCalculation(tokenAmount)
    })
    const txReceipt = await waitForTransaction({
      hash: hash.hash
    })
    console.log("Tx Receipt = ", txReceipt);
    alert("Purchased sucessfully!")
  } catch (error) {
    console.log(error.message)
    alert(error.message)
  }
  finally{
    toggleSpinner();
  }
}

async function handleSellClick() {
  const tokenAmount = document.getElementById('sell-token-amount').value;
  try {
    toggleSpinner();
    //first we need to approve some tokens to the smart contract

    const approvalHash = await writeContract({
      abi: erc20ABI,
      address: TokenAddress,
      functionName: "approve",
      args: [presaleAddress,tokenAmount*10**18],
    })
    const txReceipt2 = await waitForTransaction({hash:approvalHash.hash});
    const hash = await writeContract({
      abi: presaleABI,
      address: presaleAddress,
      functionName: "sellTokens",
      args: [tokenAmount],
    })
    const txReceipt = await waitForTransaction({
      hash: hash.hash
    })
    console.log("Tx Receipt = ", txReceipt);
    
    alert("Purchased sucessfully!")
  } catch (error) {
    console.log(error)
    alert(error)
  }
  finally{
    toggleSpinner();
  }
}

function toggleSpinner() {
  var spinner = document.getElementsByClassName('spinner-container')[0];
  console.log(spinner)
  if (spinner.style.display === 'none') {
      spinner.style.display = '';
  } else {
      spinner.style.display = 'none';
  }
}

//Event handlers 
const purchaseButton = document.getElementById("purchase-tokens");
const tokenAmountField = document.getElementById("token-amount");
const sellTokenAmountField = document.getElementById("sell-token-amount");
const sellTokenButton = document.getElementById('sell-tokens')
tokenAmountField.addEventListener('input',  updateBNBAmount);
sellTokenAmountField.addEventListener('input',  updateSellBNBAmount);

purchaseButton.addEventListener('click', handlePurchaseClick);
sellTokenButton.addEventListener('click', handleSellClick);

