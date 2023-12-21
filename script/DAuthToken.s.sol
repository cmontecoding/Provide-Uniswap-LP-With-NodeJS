// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {DAuthToken} from "../src/DAuthToken.sol";

/**
 *
 * TESTNET DEPLOYMENT: Ethereum Goerli
 *
 */

contract TestnetDeploy is Script {
    // contract(s) being deployed
    DAuthToken token;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // deploy contract
        token = new DAuthToken();

        vm.stopBroadcast();
    }
}

/**
 * TO DEPLOY:
 *
 * To load the variables in the .env file
 * > source .env
 *
 * To deploy and verify our contract
 * > forge script script/DAuthToken.s.sol:TestnetDeploy --rpc-url $ETHEREUM_GOERLI_RPC_URL --broadcast -vvvv
 */
