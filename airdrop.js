const { ethers } = require("ethers");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

function splitIntoChunks(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const AirdropContract = new ethers.Contract(process.env.AIRDROP_CONTRACT, [
        "function airdrop(address[] recipients, uint256[] amounts) external"
    ], signer);

    //const TokenContract = new ethers.Contract("0x4200000000000000000000000000000000000042", [
    const TokenContract = new ethers.Contract("0x14bb55E924F46a69acA79d8261804a75406Ce2d5", [
        "function decimals() public view returns (uint8)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function approve(address spender, uint256 limit) external"
    ], signer);

    const decimals = await TokenContract.decimals();
    const allowance = ethers.utils.formatUnits(await TokenContract.allowance(signer.address, process.env.AIRDROP_CONTRACT), decimals);

    if(allowance <= 0){
        console.log('Allowance =', allowance, 'Approve more...')
        const approveTx = await TokenContract.approve(process.env.AIRDROP_CONTRACT, ethers.constants.MaxUint256);
        await approveTx.wait();
        console.log('Approved at', approveTx.hash);
    }

    let recipients = [];
    let amounts = [];

    fs.createReadStream("airdrop_list.csv")
        .pipe(csv())
        .on("data", (row) => {
            const address = row[Object.keys(row)[0]]; // for some reason row.address doesn't work
            const amount = row.amount; 

            if (ethers.utils.isAddress(address) && !isNaN(amount)) {
                recipients.push(address);
                amounts.push(ethers.utils.parseUnits(amount, decimals));
            } else {
                console.warn(`Invalid data skipped: ${JSON.stringify(row)}`);
            }
        })
        .on("end", async () => {
            console.log("CSV file successfully processed.");
            console.log(`Total recipients: ${recipients.length}`);
            
            const recipientChunks = splitIntoChunks(recipients, +process.env.TRANSACTION_CHUNK_SIZE);
            const amountChunks = splitIntoChunks(amounts, +process.env.TRANSACTION_CHUNK_SIZE);

            try {
                for (let i = 0; i < recipientChunks.length; i++) {
                    console.log(`Sending transaction ${i + 1} with ${recipientChunks[i].length} recipients...`);

                    const tx = await AirdropContract.airdrop(recipientChunks[i], amountChunks[i]);
                    console.log(`Transaction ${i + 1} sent. Hash: ${tx.hash}`);

                    const receipt = await tx.wait();
                    console.log(`Transaction ${i + 1} confirmed in block: ${receipt.blockNumber}`, receipt.transactionHash);
                }
                console.log("Airdrop completed!");
            } catch (error) {
                console.error("Error during the airdrop:", error);
            }
        })
        .on("error", (error) => {
            console.error("Error reading the CSV file:", error);
        });
}

main();