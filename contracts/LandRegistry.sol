// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
  struct Property {
    string parcelId;
    string ipfsHash;
    address owner;
    uint256 registeredAt;
    bool active;
  }

  mapping(string => Property) public properties;
  mapping(address => string[]) public ownerProperties;

  event PropertyRegistered(string parcelId, address owner, string ipfsHash);
  event OwnershipTransferred(string parcelId, address from, address to);

  function registerProperty(
    string memory parcelId,
    string memory ipfsHash
  ) external {
    require(properties[parcelId].registeredAt == 0, "Already registered");
    properties[parcelId] = Property(parcelId, ipfsHash, msg.sender, block.timestamp, true);
    ownerProperties[msg.sender].push(parcelId);
    emit PropertyRegistered(parcelId, msg.sender, ipfsHash);
  }

  function transferOwnership(string memory parcelId, address newOwner) external {
    Property storage p = properties[parcelId];
    require(p.owner == msg.sender, "Not owner");
    require(p.active, "Property not active");
    address prev = p.owner;
    p.owner = newOwner;
    ownerProperties[newOwner].push(parcelId);
    emit OwnershipTransferred(parcelId, prev, newOwner);
  }

  function verifyOwner(string memory parcelId, address claimedOwner) external view returns (bool) {
    return properties[parcelId].owner == claimedOwner;
  }
}
