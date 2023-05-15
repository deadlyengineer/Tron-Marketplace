// var MyContract = artifacts.require("./MyContract.sol");
const DigitalMarketplace = artifacts.require("./DigitalMarketplace.sol");

module.exports = function(deployer) {
    // deployer.deploy(MyContract);
    deployer.deploy(DigitalMarketplace, 5000);
};

//TQLMUABrr6rZQqoz3H6KiECC6jaP3GogkP