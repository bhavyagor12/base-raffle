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

// Chainlink VRF v2.5 (direct funding)
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

contract Raffle50 is ReentrancyGuard, VRFConsumerBaseV2Plus {
    enum Phase {
        Enter,
        DrawRequested,
        Drawn
    }

    uint256 public vrfSubId;
    uint16 public constant MAX_WINNERS = 50;
    uint16 public constant MAX_ENTRANTS = 300;

    IVRFCoordinatorV2Plus public immutable coordinator;

    Phase public phase = Phase.Enter;
    address[] public entrants;
    mapping(address => bool) public entered;
    mapping(address => bool) public winnerMap;
    mapping(address => bool) public claimed;
    address[] public winners;
    uint256 public randomSeed;
    uint256 public vrfRequestId;

    event Enter(address indexed user);
    event DrawRequested(uint256 requestId);
    event Drawn(uint256 seed);
    event Winner(address indexed user);
    event Claimed(address indexed user);

    modifier inPhase(Phase p) {
        require(phase == p, "wrong phase");
        _;
    }

    constructor(address _coordinator) VRFConsumerBaseV2Plus(_coordinator) {
        coordinator = IVRFCoordinatorV2Plus(_coordinator);
    }

    function isEntrant(address a) external view returns (bool) {
        return entered[a];
    }

    function isWinner(address a) public view returns (bool) {
        return winnerMap[a];
    }

    function entrantsCount() external view returns (uint256) {
        return entrants.length;
    }

    function winnersCount() external view returns (uint256) {
        return winners.length;
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

    function requestRandomness(bytes32 keyHash, uint32 callbackGasLimit, uint16 requestConfirmations)
        external
        onlyOwner
        inPhase(Phase.Enter)
    {
        require(entrants.length >= MAX_WINNERS, "need >= 50 entrants");
        phase = Phase.DrawRequested;
        vrfRequestId = coordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: vrfSubId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true}) // Pay with native token
                )
            })
        );
        emit DrawRequested(vrfRequestId);
    }

    function fulfillRandomWords(uint256, /*requestId*/ uint256[] calldata randomWords) internal virtual override {
        require(phase == Phase.DrawRequested, "phase");
        randomSeed = randomWords[0];
        _selectWinners(randomSeed);
        phase = Phase.Drawn;
        emit Drawn(randomSeed);
    }

    function _selectWinners(uint256 seed) internal {
        uint256 n = entrants.length;
        uint256 picked = 0;
        uint256 i = 0;

        winners = new address[](MAX_WINNERS);

        while (picked < MAX_WINNERS) {
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

    function setVrfSubId(uint256 subId) external onlyOwner {
        vrfSubId = subId;
    }
}
