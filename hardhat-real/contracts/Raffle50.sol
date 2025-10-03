// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Open-entry raffle on Base:
 * - Max entrants: 300 (first-come, first-served)
 * - Winners: 50 (selected once, deterministically from a single VRF seed)
 * - Phases: Enter -> DrawRequested -> Drawn
 * - Safe: Ownable admin, ReentrancyGuard, no external transfers in claim()
 */
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

// Chainlink VRF v2.5 (direct funding)
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";

contract Raffle50 is ReentrancyGuard, VRFV2PlusWrapperConsumerBase, ConfirmedOwner {
    enum Phase {
        Enter,
        DrawRequested,
        Drawn
    }

    uint16 public constant MAX_ENTRANTS = 300;

    Phase public phase = Phase.Enter;
    address[] public entrants;
    mapping(address => bool) public entered;
    mapping(address => bool) public winnerMap;
    mapping(address => bool) public claimed;
    address[] public winners;
    uint256 public randomSeed;
    uint256 public vrfRequestId;
    uint16 public winnersTarget;

    event Enter(address indexed user);
    event DrawRequested(uint256 requestId);
    event Drawn(uint256 seed);
    event Winner(address indexed user);
    event Claimed(address indexed user);

    modifier inPhase(Phase p) {
        require(phase == p, "wrong phase");
        _;
    }

    constructor(address _wrapper) VRFV2PlusWrapperConsumerBase(_wrapper) ConfirmedOwner(msg.sender) {}

    function isEntrant(address a) external view returns (bool) {
        return entered[a];
    }

    function isWinner(address a) public view returns (bool) {
        return winnerMap[a];
    }

    function entrantsCount() external view returns (uint256) {
        return entrants.length;
    }

    function getWinners() external view returns (address[] memory) {
        return winners;
    }

    function enter() external inPhase(Phase.Enter) {
        require(!entered[msg.sender], "already entered");
        require(entrants.length < MAX_ENTRANTS, "entries full");

        entered[msg.sender] = true;
        entrants.push(msg.sender);
        emit Enter(msg.sender);
    }

    function requestRandomness(uint32 callbackGasLimit, uint16 requestConfirmations, uint16 winnersCount)
        external
        onlyOwner
        inPhase(Phase.Enter)
    {
        require(vrfRequestId == 0, "draw already requested");
        require(winnersCount > 0, "winners=0");
        require(winnersCount <= 50, "winners too high");
        require(winnersCount <= entrants.length, "not enough entrants");

        winnersTarget = winnersCount;
        phase = Phase.DrawRequested;
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}));
        (vrfRequestId,) = requestRandomnessPayInNative(callbackGasLimit, requestConfirmations, 1, extraArgs);
        emit DrawRequested(vrfRequestId);
    }

    function fulfillRandomWords(uint256, /*_requestId*/ uint256[] memory _randomWords) internal override {
        require(phase == Phase.DrawRequested, "phase");
        randomSeed = _randomWords[0];
        _selectWinners(randomSeed);
        phase = Phase.Drawn;
        emit Drawn(randomSeed);
    }

    function _selectWinners(uint256 seed) internal {
        uint256 n = entrants.length;
        uint256 picked = 0;
        uint256 i = 0;
        winners = new address[](winnersTarget);

        while (picked < winnersTarget) {
            address candidate = entrants[uint256(keccak256(abi.encode(seed, i))) % n];
            if (!winnerMap[candidate]) {
                winnerMap[candidate] = true;
                winners[picked] = candidate;
                emit Winner(candidate);
                unchecked {
                    ++picked;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    function claim() external nonReentrant inPhase(Phase.Drawn) {
        require(winnerMap[msg.sender], "not a winner");
        require(!claimed[msg.sender], "already claimed");
        claimed[msg.sender] = true;
        emit Claimed(msg.sender);
    }

    event Funded(address indexed from, uint256 amount);

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "insufficient balance");
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "withdraw failed");
    }
}
