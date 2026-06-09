// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
  enum PropertyStatus { ACTIVE, DISPUTED, FROZEN, LITIGATED }

  struct Property {
    string parcelId;
    string ipfsHash;
    address owner;
    uint256 registeredAt;
    bool active;
  }

  mapping(string => Property) public properties;
  mapping(address => string[]) public ownerProperties;
  mapping(string => PropertyStatus) public propertyStatus;
  mapping(string => string) public propertyVerdicts;

  address public admin;

  event PropertyRegistered(string parcelId, address owner, string ipfsHash);
  event OwnershipTransferred(string parcelId, address from, address to);
  event PropertyStatusChanged(string parcelId, PropertyStatus status);
  event VerdictRecorded(string parcelId, string verdictIpfsHash);

  modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin");
    _;
  }

  constructor() {
    admin = msg.sender;
  }

  function changeAdmin(address _newAdmin) external onlyAdmin {
    admin = _newAdmin;
  }

  function registerProperty(
    string memory parcelId,
    string memory ipfsHash
  ) external {
    require(properties[parcelId].registeredAt == 0, "Already registered");
    properties[parcelId] = Property(parcelId, ipfsHash, msg.sender, block.timestamp, true);
    propertyStatus[parcelId] = PropertyStatus.ACTIVE;
    ownerProperties[msg.sender].push(parcelId);
    emit PropertyRegistered(parcelId, msg.sender, ipfsHash);
  }

  function transferOwnership(string memory parcelId, address newOwner) external {
    Property storage p = properties[parcelId];
    require(p.owner == msg.sender, "Not owner");
    require(p.active, "Property not active");
    require(propertyStatus[parcelId] == PropertyStatus.ACTIVE, "Property status is not ACTIVE");
    address prev = p.owner;
    p.owner = newOwner;
    ownerProperties[newOwner].push(parcelId);
    emit OwnershipTransferred(parcelId, prev, newOwner);
  }

  function freezeProperty(string memory parcelId) external onlyAdmin {
    require(properties[parcelId].registeredAt > 0, "Property not registered");
    properties[parcelId].active = false;
    propertyStatus[parcelId] = PropertyStatus.FROZEN;
    emit PropertyStatusChanged(parcelId, PropertyStatus.FROZEN);
  }

  function unfreezeProperty(string memory parcelId) external onlyAdmin {
    require(properties[parcelId].registeredAt > 0, "Property not registered");
    properties[parcelId].active = true;
    propertyStatus[parcelId] = PropertyStatus.ACTIVE;
    emit PropertyStatusChanged(parcelId, PropertyStatus.ACTIVE);
  }

  function disputeProperty(string memory parcelId) external onlyAdmin {
    require(properties[parcelId].registeredAt > 0, "Property not registered");
    properties[parcelId].active = false;
    propertyStatus[parcelId] = PropertyStatus.DISPUTED;
    emit PropertyStatusChanged(parcelId, PropertyStatus.DISPUTED);
  }

  function litigateProperty(string memory parcelId) external onlyAdmin {
    require(properties[parcelId].registeredAt > 0, "Property not registered");
    properties[parcelId].active = false;
    propertyStatus[parcelId] = PropertyStatus.LITIGATED;
    emit PropertyStatusChanged(parcelId, PropertyStatus.LITIGATED);
  }

  function recordVerdict(string memory parcelId, string memory verdictIpfsHash) external onlyAdmin {
    require(properties[parcelId].registeredAt > 0, "Property not registered");
    propertyVerdicts[parcelId] = verdictIpfsHash;
    emit VerdictRecorded(parcelId, verdictIpfsHash);
  }

  function verifyOwner(string memory parcelId, address claimedOwner) external view returns (bool) {
    return properties[parcelId].owner == claimedOwner;
  }
}
