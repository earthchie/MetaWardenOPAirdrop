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

    const contractABI = [
        "function airdrop(address[] recipients, uint256[] amounts) external"
    ];
    const contract = new ethers.Contract(process.env.AIRDROP_CONTRACT, contractABI, signer);

    let recipients = [];
    let amounts = [];

    fs.createReadStream("airdrop_list.csv")
        .pipe(csv())
        .on("data", (row) => {
            const address = row[Object.keys(row)[0]]; // for some reason row.address doesn't work
            const amount = row.amount; 

            if (ethers.utils.isAddress(address) && !isNaN(amount)) {
                recipients.push(address);
                amounts.push(ethers.utils.parseUnits(amount, 18));
            } else {
                console.warn(`Invalid data skipped: ${JSON.stringify(row)}`);
            }
        })
        .on("end", async () => {
            console.log("CSV file successfully processed.");
            console.log(`Total recipients: ${recipients.length}`);
            
            const recipientChunks = splitIntoChunks(recipients, process.env.TRANSACTION_CHUNK_SIZE);
            const amountChunks = splitIntoChunks(amounts, process.env.TRANSACTION_CHUNK_SIZE);

            try {
                for (let i = 0; i < recipientChunks.length; i++) {
                    console.log(`Sending transaction ${i + 1} with ${recipientChunks[i].length} recipients...`);

                    const tx = await contract.airdrop(recipientChunks[i], amountChunks[i]);
                    console.log(`Transaction ${i + 1} sent. Hash: ${tx.hash}`);

                    const receipt = await tx.wait();
                    console.log(`Transaction ${i + 1} confirmed in block: ${receipt.blockNumber}`, receipt.hash);
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