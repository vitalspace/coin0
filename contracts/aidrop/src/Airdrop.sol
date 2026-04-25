// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AirdropPool {
    address public creator;
    address public mint;
    address public vault;
    uint256 public totalAmount;
    uint256 public maxUsers;
    uint256 public distributionTime;
    uint256 public joinedCount;
    bool public isCancelled;
    uint256 public counter;
    address public immutable airdropContract;

    mapping(address => bool) public userRegistrations;
    mapping(address => bool) public claimed;

    event UserRegistered(address indexed user, address indexed airdropPool);
    event Claimed(address indexed user, address indexed airdropPool, uint256 amount);
    event Cancelled(address indexed airdropPool);

    function addressesEqual(address a, address b) internal pure returns (bool) {
        bytes20 aBytes = bytes20(a);
        bytes20 bBytes = bytes20(b);
        for (uint i = 0; i < 20; i++) {
            bytes1 aByte = aBytes[i];
            bytes1 bByte = bBytes[i];
            // Convert uppercase to lowercase
            if (aByte >= 0x41 && aByte <= 0x5A) aByte = bytes1(uint8(aByte) + 32);
            if (bByte >= 0x41 && bByte <= 0x5A) bByte = bytes1(uint8(bByte) + 32);
            if (aByte != bByte) return false;
        }
        return true;
    }

    modifier onlyAirdropContract() {
        require(msg.sender == airdropContract, "Only Airdrop contract can call this");
        _;
    }

    constructor(
        address _creator,
        address _mint,
        uint256 _totalAmount,
        uint256 _maxUsers,
        uint256 _distributionTime,
        uint256 _counter
    ) {
        // msg.sender here is the Airdrop factory contract
        airdropContract = msg.sender;
        creator = _creator;
        mint = _mint;
        vault = address(this);
        totalAmount = _totalAmount;
        maxUsers = _maxUsers;
        distributionTime = _distributionTime;
        counter = _counter;
        joinedCount = 0;
        isCancelled = false;
    }

    function register(address caller) external onlyAirdropContract returns (bool) {
        require(!isCancelled, "Pool is cancelled");
        require(block.timestamp < distributionTime, "Registration period ended");
        require(joinedCount < maxUsers, "Pool is full");
        require(!userRegistrations[caller], "Already registered");

        userRegistrations[caller] = true;
        joinedCount++;

        emit UserRegistered(caller, address(this));
        return true;
    }

    function claim(address caller) external onlyAirdropContract returns (bool) {
        require(!isCancelled, "Pool is cancelled");
        require(userRegistrations[caller], "Not registered for this pool");
        require(block.timestamp >= distributionTime, "Distribution time not reached");
        require(!claimed[caller], "Already claimed");
        require(joinedCount > 0, "No participants");

        uint256 amountPerUser = totalAmount / joinedCount;
        claimed[caller] = true;

        require(IERC20(mint).transfer(caller, amountPerUser), "Transfer failed");

        emit Claimed(caller, address(this), amountPerUser);
        return true;
    }

    function cancel(address caller) external onlyAirdropContract returns (bool) {
        require(addressesEqual(caller, creator), "Only creator can cancel");
        require(!isCancelled, "Already cancelled");
        require(block.timestamp < distributionTime, "Cannot cancel after distribution time");

        isCancelled = true;

        require(IERC20(mint).transfer(creator, totalAmount), "Refund failed");

        emit Cancelled(address(this));
        return true;
    }
}

contract Airdrop {
    mapping(uint256 => address) private _airdropPools;
    mapping(address => mapping(address => UserRegistrationInfo)) private _userRegistrations;

    struct UserRegistrationInfo {
        address user;
        address airdropPool;
        bool claimed;
    }

    event AirdropCreated(address indexed airdropPool, address indexed creator, address mint, uint256 totalAmount);

    function register(address airdropPool) external returns (bool) {
        AirdropPool pool = AirdropPool(airdropPool);
        return pool.register(msg.sender);
    }

    function claim(address airdropPool) external returns (bool) {
        AirdropPool pool = AirdropPool(airdropPool);
        return pool.claim(msg.sender);
    }

    function cancel(address airdropPool) external returns (bool) {
        AirdropPool pool = AirdropPool(airdropPool);
        return pool.cancel(msg.sender);
    }

    function airdropPools(uint256 index) external view returns (
        address creator,
        address mint,
        address vault,
        uint256 totalAmount,
        uint256 maxUsers,
        uint256 distributionTime,
        uint256 joinedCount,
        bool isCancelled,
        uint256 counter
    ) {
        address poolAddress = _airdropPools[index];
        if (poolAddress == address(0)) {
            return (address(0), address(0), address(0), 0, 0, 0, 0, false, 0);
        }

        AirdropPool pool = AirdropPool(poolAddress);
        return (
            pool.creator(),
            pool.mint(),
            pool.vault(),
            pool.totalAmount(),
            pool.maxUsers(),
            pool.distributionTime(),
            pool.joinedCount(),
            pool.isCancelled(),
            pool.counter()
        );
    }

    function userRegistrations(address poolAddress, address user) external view returns (
        address userAddr,
        address airdropPool,
        bool claimed
    ) {
        AirdropPool pool = AirdropPool(poolAddress);
        bool hasClaimed = pool.claimed(user);
        return (user, poolAddress, hasClaimed);
    }

    function getPoolCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < 1000; i++) {
            if (_airdropPools[i] != address(0)) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    function getPool(uint256 index) external view returns (address) {
        return _airdropPools[index];
    }

    function createAirdrop(
        address mint,
        uint256 totalAmount,
        uint256 maxUsers,
        uint256 distributionTime,
        uint256 counter
    ) external returns (address) {
        require(totalAmount > 0, "Total amount must be greater than 0");
        require(distributionTime > block.timestamp, "Distribution time must be in the future");
        require(maxUsers > 0, "Max users must be greater than 0");
        require(mint != address(0), "Invalid mint address");

        require(IERC20(mint).transferFrom(msg.sender, address(this), totalAmount), "Token transfer failed");

        AirdropPool pool = new AirdropPool(
            msg.sender,
            mint,
            totalAmount,
            maxUsers,
            distributionTime,
            counter
        );

        address poolAddress = address(pool);
        _airdropPools[counter] = poolAddress;

        require(IERC20(mint).transfer(poolAddress, totalAmount), "Transfer to pool failed");

        emit AirdropCreated(poolAddress, msg.sender, mint, totalAmount);
        return poolAddress;
    }
}