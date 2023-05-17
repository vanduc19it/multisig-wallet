// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract MultisigWallet is Initializable {
    uint256 private _requiredSignatures; // The number of signatures required to execute the transaction.
    address[] private _owners; //aray of owners address

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        mapping(address => bool) signatures;
        uint numConfirmations;
    }

    Transaction[] private _transactions; //array of transactions

    event TransactionCreated(uint256 transactionId, address to, uint256 value, bytes data);
    event TransactionSigned(uint256 indexed transactionId, address indexed signer);
    event TransactionExecuted(uint256 transactionId, address executer);
    event RevokeConfirmation(address indexed owner, uint indexed transactionId);

    //used to initialize the contract and set the initial parameters such as list owners and required number of signatures
    function initialize(address[] memory owners, uint256 requiredSignatures) public initializer {
        require(owners.length > 0, "At least one owner required");
        require(requiredSignatures > 0 && requiredSignatures <= owners.length, "Invalid number of required signatures");
        _owners = owners;
        _requiredSignatures = requiredSignatures;
    }

    //use to create new transaction
    function submitTransaction(address to, uint256 value, bytes memory data) public {
        require(isOwner(msg.sender), "Not an owner!");
        require(to != address(0), "Invalid destination address");
        require(value >= 0, "Invalid value");

        uint256 transactionId = _transactions.length;
        _transactions.push(); //push transaction to array _transactions
        // Assign newly created transaction to variable transaction
        Transaction storage transaction = _transactions[transactionId];
        transaction.to = to;
        transaction.value = value;
        transaction.data = data;
        transaction.executed = false;

        emit TransactionCreated(transactionId, to, value, data);
    }

    //use to confirm transaction by owners
    function signTransaction(uint256 transactionId) public {
        require(transactionId < _transactions.length, "Invalid transaction ID");
        Transaction storage transaction = _transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(isOwner(msg.sender), "Only owners can sign transactions");
        require(!transaction.signatures[msg.sender], "Transaction already signed by this owner");
        transaction.numConfirmations += 1;
        transaction.signatures[msg.sender] = true;
        emit TransactionSigned(transactionId, msg.sender);
        if(countSignatures(transaction) == _requiredSignatures) {
            executeTransaction(transactionId);
        }
    }

    //using execute transactions after confirm by owners
    function executeTransaction(uint256 transactionId) private {
        require(transactionId < _transactions.length, "Invalid transaction ID");
        Transaction storage transaction = _transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(countSignatures(transaction) >= _requiredSignatures, "Insufficient valid signatures");
        transaction.executed = true;
        (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");
        emit TransactionExecuted(transactionId, msg.sender);
    }

    //cancel confirm transaction
    function revokeConfirmation(uint256 transactionId) public {
        require(isOwner(msg.sender), "Not owner");
        require(transactionId < _transactions.length, "Transaction does not exist");
        require(!_transactions[transactionId].executed, "Transaction already executed");

        Transaction storage transaction = _transactions[transactionId];

        require(transaction.signatures[msg.sender], "Transaction not confirmed");

        transaction.numConfirmations -= 1;
        transaction.signatures[msg.sender] = false;

        emit RevokeConfirmation(msg.sender,transactionId);
    }
    //check if owner
    function isOwner(address account) public view returns (bool) {
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == account) {
                return true;
            }
        }
        return false;
    }
    //return amount of signatures
    function countSignatures(Transaction storage transaction) private view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _owners.length; i++) {
            if (transaction.signatures[_owners[i]]) {
                count++;
            }
        }
        return count;
    }

    //get and return transaction detail
    function getTransaction(uint256 transactionId) public view returns (address, uint256, bytes memory, bool, uint256) {
        require(transactionId < _transactions.length, "Invalid transaction ID");

        Transaction storage transaction = _transactions[transactionId];
        return (transaction.to, transaction.value, transaction.data, transaction.executed, countSignatures(transaction));
    }
    //return amount of transaction
    function getTransactionCount() public view returns (uint) {
        return _transactions.length;
    }
    //get array of owners
    function getOwners() public view returns(address[] memory) {
        return _owners;
    }
    //return amount of signature nesscessary to excute transaction
    function getRequiredSignatures() public view returns(uint256) {
        return _requiredSignatures;
    }

    receive() external payable {} //receive eth from other address tranfer to this multisig wallet address
}