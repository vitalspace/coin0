// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingPool {
    address public creator;
    address public rewardMint;
    address public vault;
    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public rewardsClaimed;
    uint256 public lockSeconds;
    uint256 public multiplier;
    uint256 public counter;

    mapping(address => StakeInfo) public stakes;

    struct StakeInfo {
        address user;
        address pool;
        uint256 amount;
        uint256 endTime;
        bool claimed;
    }

    event Staked(address indexed user, address indexed pool, uint256 amount);
    event Claimed(address indexed user, address indexed pool, uint256 reward);
    event PoolCreated(address indexed pool, address indexed creator, address rewardMint);

    constructor(
        address _creator,
        address _rewardMint,
        uint256 _totalRewards,
        uint256 _lockSeconds,
        uint256 _multiplier,
        uint256 _counter
    ) {
        creator = _creator;
        rewardMint = _rewardMint;
        vault = address(this);
        totalStaked = 0;
        totalRewards = _totalRewards;
        rewardsClaimed = 0;
        lockSeconds = _lockSeconds;
        multiplier = _multiplier;
        counter = _counter;
    }

    // Llamado internamente por Staking.stake() con native tokens en msg.value
    function stake(address caller, uint256 amount) external payable returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount, "msg.value must match amount");
        require(stakes[caller].amount == 0, "Already staked");

        stakes[caller] = StakeInfo({
            user: caller,
            pool: address(this),
            amount: amount,
            endTime: block.timestamp + lockSeconds,
            claimed: false
        });

        totalStaked += amount;
        emit Staked(caller, address(this), amount);
        return true;
    }

    function claim(address caller) external returns (bool) {
        require(stakes[caller].amount > 0, "No stake found");
        require(!stakes[caller].claimed, "Already claimed");
        require(block.timestamp >= stakes[caller].endTime, "Lock period not ended");

        StakeInfo memory userStake = stakes[caller];
        uint256 reward = calculateReward(userStake.amount);

        stakes[caller].claimed = true;
        rewardsClaimed += reward;

        // Devolver principal en token nativo
        (bool sentPrincipal, ) = payable(caller).call{value: userStake.amount}("");
        require(sentPrincipal, "Principal return failed");

        // Pagar recompensa en ERC-20
        require(IERC20(rewardMint).transfer(caller, reward), "Reward transfer failed");

        emit Claimed(caller, address(this), reward);
        return true;
    }

    function calculateReward(uint256 stakedAmount) public view returns (uint256) {
        if (totalStaked == 0) return 0;
        uint256 userShare = (stakedAmount * 1e6) / totalStaked;
        uint256 totalPoolRewards = totalRewards - rewardsClaimed;
        uint256 calculatedReward = (userShare * totalPoolRewards) / 1e6;
        uint256 withMultiplier = (calculatedReward * multiplier) / 10000;
        return withMultiplier;
    }

    function getStakeInfo(address user) external view returns (
        address userAddr,
        address poolAddr,
        uint256 amount,
        uint256 endTime,
        bool claimed
    ) {
        StakeInfo memory s = stakes[user];
        return (s.user, s.pool, s.amount, s.endTime, s.claimed);
    }

    // Necesario para recibir native tokens del contrato Staking
    receive() external payable {}
}

contract Staking {
  using SafeERC20 for IERC20;
  
  mapping(uint256 => address) private _stakingPools;

  event StakingPoolCreated(
    address indexed pool,
    address indexed creator,
    address rewardMint
  );

    // El usuario envía native tokens en msg.value para hacer stake
    function stake(address pool, uint256 amount) external payable returns (bool) {
        require(msg.value == amount, "msg.value must equal amount");
        StakingPool stakingPool = StakingPool(payable(pool));
        // Reenviar native tokens al pool
        return stakingPool.stake{value: amount}(msg.sender, amount);
    }

    function claim(address pool) external returns (bool) {
        StakingPool stakingPool = StakingPool(payable(pool));
        return stakingPool.claim(msg.sender);
    }

  function createStakingPool(
    address rewardMint,
    uint256 totalRewards,
    uint256 lockSeconds,
    uint256 multiplier,
    uint256 counter
  ) external returns (address) {
    require(totalRewards > 0, "Total rewards must be greater than 0");
    require(lockSeconds > 0, "Lock seconds must be greater than 0");
    require(rewardMint != address(0), "Invalid rewardMint address");

    // El creador debe haber hecho approve de rewardMint antes de llamar esto
    IERC20(rewardMint).safeTransferFrom(msg.sender, address(this), totalRewards);

    StakingPool pool = new StakingPool(
      msg.sender,
      rewardMint,
      totalRewards,
      lockSeconds,
      multiplier,
      counter
    );

    address poolAddress = address(pool);
    _stakingPools[counter] = poolAddress;

    // Transferir los ERC-20 rewards al pool recién creado
    IERC20(rewardMint).safeTransfer(poolAddress, totalRewards);

    emit StakingPoolCreated(poolAddress, msg.sender, rewardMint);
    return poolAddress;
  }

    function stakingPools(uint256 index) external view returns (
        address creator,
        address rewardMint,
        address vault,
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 rewardsClaimed,
        uint256 lockSeconds,
        uint256 multiplier,
        uint256 counter
    ) {
        address poolAddress = _stakingPools[index];
        if (poolAddress == address(0)) {
            return (address(0), address(0), address(0), 0, 0, 0, 0, 0, 0);
        }
        StakingPool pool = StakingPool(payable(poolAddress));
        return (
            pool.creator(),
            pool.rewardMint(),
            pool.vault(),
            pool.totalStaked(),
            pool.totalRewards(),
            pool.rewardsClaimed(),
            pool.lockSeconds(),
            pool.multiplier(),
            pool.counter()
        );
    }

    function stakes(address pool, address user) external view returns (
        address userAddr,
        address poolAddr,
        uint256 amount,
        uint256 endTime,
        bool claimed
    ) {
        StakingPool stakingPool = StakingPool(payable(pool));
        return stakingPool.getStakeInfo(user);
    }

    function stakingPoolsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < 1000; i++) {
            if (_stakingPools[i] != address(0)) {
                count++;
            }
        }
        return count;
    }

    function getPool(uint256 index) external view returns (address) {
        return _stakingPools[index];
    }
}