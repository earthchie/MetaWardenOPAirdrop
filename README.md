# MetaWardenOPAirdrop

⚠️ **WARNING: This project is untested! Proceed with caution.** ⚠️


## Steps to Deploy and Run the Airdrop

### 1. Clone the Repository
Start by cloning the project repository and navigating to the project directory:
```bash
git clone https://github.com/earthchie/MetaWardenOPAirdrop
cd ./MetaWardenOPAirdrop/
```

---

### 2. Prepare the Airdrop List
Ensure the file `airdrop_list.csv` contains the list of recipients and their corresponding amounts in the following format:
```
address,amount
0xRecipientAddress1,Amount1
0xRecipientAddress2,Amount2
```

---

### 3. Deploy the Airdrop Smart Contract
Navigate to the Hardhat project folder and install dependencies:
```bash
cd ./hardhat
npm install
```

Copy the environment variables template and edit it:
```bash
cp .env.example .env
nano .env
```

Set the `PRIVATE_KEY` of the contract deployer in the `.env` file and save it.

Deploy the smart contract:
```bash
npx hardhat deploy --network OP --tags MetaWardenOPAirdrop
```

---

### 4. Verify the Smart Contract
Verify the deployed smart contract on the Optimism network:
```bash
npx hardhat verify --network OP 0x...your_contract_address_from_step_3...
```

Replace `0x...your_contract_address_from_step_3...` with the actual contract address from the deployment step.

---

### 5. Prepare the Airdrop Script
Navigate back to the main project folder and install dependencies:
```bash
cd ..
npm install
```

Copy the environment variables template and edit it:
```bash
cp .env.example .env
nano .env
```

Set the following variables in the `.env` file:
- `PRIVATE_KEY`: The private key of the wallet holding the OP tokens to be airdropped.
- `AIRDROP_CONTRACT`: The address of the deployed airdrop smart contract.

Save the file when done.

---

### 6. Execute the Airdrop Script
Run the airdrop script to distribute the tokens:
```bash
node index.js
```

---

### 7. Done!
Once the script completes, your OP tokens will be distributed to the recipients listed in `airdrop_list.csv`.

---

## Notes
- Make sure you have sufficient OP tokens in the wallet associated with the private key used in the `.env` file.
- Test the contract and script on a test network before deploying and running on the main network.
- Use this project responsibly and ensure proper auditing if used in production.