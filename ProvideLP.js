require('dotenv').config();
const { Web3 } = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { ethers } = require('ethers');

// Configuration
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    console.error('Please provide PRIVATE_KEY in .env file');
    process.exit(1);
}
const tokenAddress = '0xc855dF1A5C8056887b63B983382dA81c901695d1'; // Address of your ERC-20 token
const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Uniswap V2 Router address for Goerli
const amountTokenDesired = 1000000000; // Amount of ERC-20 token desired to provide liquidity (in token's smallest units)
const amountETHDesired = 1000000000; // Amount of ETH desired to provide liquidity (in wei)
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

// Create Ethereum provider
const infuraUrl = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`;
const provider = new ethers.providers.JsonRpcProvider(infuraUrl);

// Create wallet instance
const wallet = new ethers.Wallet(privateKey, provider).connect(provider);

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
        { value: amountETHDesired, gasPrice: ethers.utils.parseUnits('10', 'gwei'), gasLimit: 3000000 }
    );

    console.log('Liquidity provision transaction:', tx.hash);

    // Wait for the transaction to be mined
    await tx.wait();
    console.log('Liquidity added successfully!');
}

provideLiquidity().catch((err) => console.error('Error adding liquidity:', err));
