const { expect } = require("chai");

async function deployContract() {
    
    const [deployer, alice, bob] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("Token");
    const Token = await TokenFactory.deploy();
    await Token.deployed();

    const AirdropFactory = await ethers.getContractFactory("MetaWardenOPAirdrop");
    const Airdrop = await AirdropFactory.deploy();
    await Airdrop.deployed();

    return { Airdrop, Token, deployer, alice, bob };
}

describe("Airdrop", function () {

    it("Should Airdrop Successfully", async function () {
        const { Airdrop, Token, deployer, alice, bob } = await deployContract();

        const Ten = ethers.utils.parseUnits('10');

        const mintTx = await Token.mintTo(deployer.address, ethers.utils.parseUnits('20'));
        await mintTx.wait();
        
        const approveTx = await Token.approve(Airdrop.address, ethers.constants.MaxUint256);
        await approveTx.wait();
        
        const airdropTx = await Airdrop.airdrop([alice.address, bob.address], [Ten, Ten]);
        await airdropTx.wait();
        
        const balanceAlice = await Token.balanceOf(alice.address);
        expect(balanceAlice).to.equal(Ten);

        const balanceBob = await Token.balanceOf(bob.address);
        expect(balanceBob).to.equal(Ten);
    });

})