// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface public immutable priceFeed;

    constructor(address aggregatorAddress) {
        require(aggregatorAddress != address(0), "Invalid aggregator");
        priceFeed = AggregatorV3Interface(aggregatorAddress);
    }

    function getLatestPrice() public view returns (int256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return answer;
    }

    function getPriceFeedDecimals() external view returns (uint8) {
        return priceFeed.decimals();
    }
}
