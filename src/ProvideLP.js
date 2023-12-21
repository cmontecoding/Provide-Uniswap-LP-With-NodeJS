require('dotenv').config();
const { Web3 } = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { ethers } = require('ethers');

// Configuration
const providerUrl = process.env.PROVIDER_URL;
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || !providerUrl) {
    console.error('Please provide PRIVATE_KEY and PROVIDER_URL in .env file');
    process.exit(1);
}
const tokenAddress = 'TOKEN_ADDRESS'; // Address of your ERC-20 token
const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Uniswap V2 Router address for Goerli
const amountTokenDesired = ethers.utils.parseUnits('100', '0'); // Amount of ERC-20 token desired to provide liquidity (in token's smallest units)
const amountETHDesired = ethers.utils.parseEther('100'); // Amount of ETH desired to provide liquidity (in wei)
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

// Create Ethereum provider
const web3 = new Web3(providerUrl);

// Create wallet instance
const wallet = new ethers.Wallet(privateKey, web3);

// Create Uniswap V2 Router contract instance
const router = new ethers.Contract(routerAddress, [
    'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
], wallet);

// Approve Router to spend ERC-20 tokens
const tokenContract = new ethers.Contract(tokenAddress, [
    'function approve(address spender, uint amount) external returns (bool)',
], wallet);

const amountTokenMin = 0; // Minimum amount of token accepted
const amountETHMin = 0; // Minimum amount of ETH accepted

async function provideLiquidity() {
    // Approve tokens for spending by the router
    const approved = await tokenContract.approve(routerAddress, amountTokenDesired, { gasLimit: 50000 });
    console.log('Token approval transaction:', approved.hash);

    // Provide liquidity
    const tx = await router.addLiquidityETH(
        tokenAddress,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        wallet.address,
        deadline,
        { value: amountETHDesired, gasLimit: 3000000 }
    );

    console.log('Liquidity provision transaction:', tx.hash);

    // Wait for the transaction to be mined
    await tx.wait();
    console.log('Liquidity added successfully!');
}

provideLiquidity().catch((err) => console.error('Error adding liquidity:', err));
