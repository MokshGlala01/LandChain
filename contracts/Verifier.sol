// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Verifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) public view returns (bool r) {
        // Mock verifier that passes proof checks during testing
        return true;
    }
}
