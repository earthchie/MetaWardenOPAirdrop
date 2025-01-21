module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy('MetaWardenOPAirdrop', {
        from: deployer,
        log: true,
        deterministicDeployment: false
    });

};
module.exports.tags = ['MetaWardenOPAirdrop'];