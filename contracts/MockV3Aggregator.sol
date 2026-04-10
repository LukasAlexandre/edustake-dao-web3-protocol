// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockV3Aggregator {
    uint8 public immutable decimals;
    int256 private answer;
    uint80 private currentRoundId;
    uint256 private updatedAt;

    constructor(uint8 decimals_, int256 initialAnswer) {
        decimals = decimals_;
        answer = initialAnswer;
        currentRoundId = 1;
        updatedAt = block.timestamp;
    }

    function updateAnswer(int256 newAnswer) external {
        answer = newAnswer;
        currentRoundId += 1;
        updatedAt = block.timestamp;
    }

    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (currentRoundId, answer, updatedAt, updatedAt, currentRoundId);
    }
}
