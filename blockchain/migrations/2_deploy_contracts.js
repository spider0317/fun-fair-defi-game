var StringSupport = artifacts.require("./StringSupport.sol");
var GamesOnStakes = artifacts.require("./GamesOnStakes.sol");

module.exports = function(deployer) {
    deployer.deploy(StringSupport)
    deployer.link(StringSupport, GamesOnStakes)

    deployer.deploy(GamesOnStakes, 5)           // Timeout: 5 seconds
};