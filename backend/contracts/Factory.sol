// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/proxy/Clones.sol"; 
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

//This smc using deploy and manage multisig wallets. use avalable model multisig wallet to deploy new wallet.
contract MultisigFactory {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public owner; // owner wallet
    address public implementation; // store available smc model.
    mapping(address => EnumerableSet.AddressSet) private deployments; // track deployed Multisig contract addresses by each deployer.

    event ImplementationUpdated(address _caller, address _implementation);
    event ContractDeployed(address indexed _deployer, address _deployedContract, address _implementation);

    constructor(address _implementation) {
        owner = msg.sender;
        implementation = _implementation;
    }

    // update address of template smc multisig
    function setImplementation(address _implementation) public {
        require(msg.sender == owner, "Not owner!");
        implementation = _implementation;
        emit ImplementationUpdated(msg.sender, _implementation);
    }

    //deploy a new contract multisig wallet 
    function deployContract(bytes memory _data) public {
        //using clone.clone to create duplicate of template
        address deployedContract = Clones.clone(implementation);
        //call data and check if success
        (bool success, ) = deployedContract.call(_data);
        require(success, "Failed to initialize contract!");
        //add deployed contratc to deployment of msg.sender and check
        bool added = deployments[msg.sender].add(deployedContract);
        require(added, "Failed to add to registry!");
        emit ContractDeployed(msg.sender, deployedContract, implementation);
    }

    //return an array of address contract multisig deployed by deployeer
    function getDeployed(address _deployer) public view returns(address[] memory) {
        return deployments[_deployer].values();
    }

    //return amount of contract multisig deployed by deployer
    function countDeployed(address _deployer) public view returns(uint256) {
        return deployments[_deployer].length();
    }
}