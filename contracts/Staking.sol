// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PriceConsumer.sol";

contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 pendingRewards;
        uint256 lastUpdate;
    }

    IERC20 public immutable eduToken;
    PriceConsumer public immutable priceConsumer;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant YEAR_IN_SECONDS = 365 days;
    uint256 public constant BASE_APY_BPS = 1_000;
    uint256 public constant BONUS_APY_BPS = 200;
    uint256 public constant DISCOUNT_APY_BPS = 200;

    uint256 public totalStaked;
    uint256 public rewardReserve;

    mapping(address => UserInfo) private users;

    event RewardsFunded(uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewardsPaid);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address tokenAddress, address priceConsumerAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token");
        require(priceConsumerAddress != address(0), "Invalid oracle");

        eduToken = IERC20(tokenAddress);
        priceConsumer = PriceConsumer(priceConsumerAddress);
    }

    function fundRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        eduToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardReserve += amount;

        emit RewardsFunded(amount);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        _updateRewards(msg.sender);

        users[msg.sender].amount += amount;
        totalStaked += amount;

        eduToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        _updateRewards(msg.sender);

        UserInfo storage user = users[msg.sender];
        require(user.amount >= amount, "Insufficient staked balance");

        uint256 rewardsToPay = user.pendingRewards;
        require(rewardReserve >= rewardsToPay, "Insufficient reward reserve");

        user.amount -= amount;
        totalStaked -= amount;
        user.pendingRewards = 0;
        rewardReserve -= rewardsToPay;

        eduToken.safeTransfer(msg.sender, amount + rewardsToPay);

        emit Unstaked(msg.sender, amount, rewardsToPay);
    }

    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);

        UserInfo storage user = users[msg.sender];
        uint256 rewardsToPay = user.pendingRewards;

        require(rewardsToPay > 0, "No rewards available");
        require(rewardReserve >= rewardsToPay, "Insufficient reward reserve");

        user.pendingRewards = 0;
        rewardReserve -= rewardsToPay;

        eduToken.safeTransfer(msg.sender, rewardsToPay);

        emit RewardsClaimed(msg.sender, rewardsToPay);
    }

    function getStakedBalance(address account) external view returns (uint256) {
        return users[account].amount;
    }

    function getPendingRewards(address account) public view returns (uint256) {
        UserInfo memory user = users[account];

        if (user.lastUpdate == 0 || user.amount == 0) {
            return user.pendingRewards;
        }

        uint256 elapsed = block.timestamp - user.lastUpdate;
        uint256 newlyAccrued = (user.amount * elapsed * _currentApyBps()) / YEAR_IN_SECONDS / BASIS_POINTS;

        return user.pendingRewards + newlyAccrued;
    }

    function getCurrentApyBps() external view returns (uint256) {
        return _currentApyBps();
    }

    function getUserInfo(address account) external view returns (UserInfo memory) {
        return users[account];
    }

    function _updateRewards(address account) internal {
        UserInfo storage user = users[account];

        if (user.lastUpdate == 0) {
            user.lastUpdate = block.timestamp;
            return;
        }

        if (user.amount > 0) {
            uint256 elapsed = block.timestamp - user.lastUpdate;
            uint256 newlyAccrued = (user.amount * elapsed * _currentApyBps()) / YEAR_IN_SECONDS / BASIS_POINTS;
            user.pendingRewards += newlyAccrued;
        }

        user.lastUpdate = block.timestamp;
    }

    function _currentApyBps() internal view returns (uint256) {
        uint256 apyBps = BASE_APY_BPS;

        // The oracle slightly changes the APY to demonstrate external data usage.
        try priceConsumer.getLatestPrice() returns (int256 ethUsdPrice) {
            if (ethUsdPrice >= 3_000e8) {
                apyBps += BONUS_APY_BPS;
            } else if (ethUsdPrice > 0 && ethUsdPrice <= 1_500e8) {
                apyBps -= DISCOUNT_APY_BPS;
            }
        } catch {
            return apyBps;
        }

        return apyBps;
    }
}
