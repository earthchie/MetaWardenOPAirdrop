require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
    solidity: {
        compilers: [
            {
                version: '0.8.26',
                settings: {
                    optimizer: {
                        enabled: true
                    }
                }
            },
        ],
    },
    namedAccounts: {
        deployer: 0,
    },
    networks: {

        OP: {
            url: process.env.OP_RPC,
            chainId: 10,
            accounts: [process.env.PRIVATE_KEY]
        }

    },
    etherscan: {
        apiKey: {
            OP: process.env.OPSCAN_API_KEY,
        },
        customChains: [{
            network: 'OP',
            chainId: 10,
            urls: {
                apiURL: "https://api-optimistic.etherscan.io/api",
                browserURL: "https://optimistic.etherscan.io/"
            }
        }]
    }
};
