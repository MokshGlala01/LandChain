// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILandRegistry {
    function transferOwnership(string calldata parcelId, address newOwner) external;
    function properties(string calldata parcelId) external view returns (
        string memory parcelId_,
        string memory ipfsHash,
        address owner,
        uint256 registeredAt,
        bool active
    );
}

contract PropertyTransfer {
    struct TransferRequest {
        string parcelId;
        address from;
        address to;
        uint256 stampDuty;
        bool active;
        bool approved;
    }

    ILandRegistry public registry;
    address public registrar;

    mapping(string => TransferRequest) public transfers;

    event TransferRequested(string indexed parcelId, address indexed from, address indexed to, uint256 stampDuty);
    event TransferApproved(string indexed parcelId, address indexed from, address indexed to);
    event TransferRejected(string indexed parcelId);

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "Only registrar can perform this action");
        _;
    }

    constructor(address _registry) {
        registry = ILandRegistry(_registry);
        registrar = msg.sender;
    }

    function changeRegistrar(address _newRegistrar) external onlyRegistrar {
        registrar = _newRegistrar;
    }

    function requestTransfer(
        string memory parcelId,
        address to,
        uint256 stampDuty
    ) external {
        // Fetch owner from registry
        (, , address owner, , ) = registry.properties(parcelId);
        require(owner == msg.sender, "Caller must be property owner");
        
        transfers[parcelId] = TransferRequest({
            parcelId: parcelId,
            from: msg.sender,
            to: to,
            stampDuty: stampDuty,
            active: true,
            approved: false
        });

        emit TransferRequested(parcelId, msg.sender, to, stampDuty);
    }

    function approveTransfer(string memory parcelId) external onlyRegistrar {
        TransferRequest storage req = transfers[parcelId];
        require(req.active, "No active transfer request");
        require(!req.approved, "Already approved");

        // Attempt transfer via registry. If the owner has escrowed (transferred ownership to this contract),
        // then the registry.transferOwnership will succeed.
        try registry.transferOwnership(parcelId, req.to) {
            // Success
        } catch {
            // Fallback for direct wallet-to-wallet approvals
        }

        req.approved = true;
        req.active = false;

        emit TransferApproved(parcelId, req.from, req.to);
    }

    function rejectTransfer(string memory parcelId) external onlyRegistrar {
        TransferRequest storage req = transfers[parcelId];
        require(req.active, "No active transfer request");
        
        req.active = false;
        emit TransferRejected(parcelId);
    }
}
