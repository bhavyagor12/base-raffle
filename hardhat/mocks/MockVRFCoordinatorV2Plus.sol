// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal mock for VRFCoordinatorV2Plus to test Raffle locally.
/// It simulates requestRandomWords and allows manual fulfillment with a seed.
interface IVRFV2PlusConsumer {
    function rawFulfillRandomWords(bytes32 requestId, uint256[] calldata randomWords) external;
}

contract MockVRFCoordinatorV2Plus {
    struct Request {
        address consumer;
        bytes32 keyHash;
        uint32 callbackGasLimit;
        uint16 requestConfirmations;
        uint32 numWords;
    }

    mapping(bytes32 => Request) public requests;
    uint256 public nonce;

    struct RandomWordsRequest {
        bytes32 keyHash;
        uint256 subId;
        uint16 requestConfirmations;
        uint32 callbackGasLimit;
        uint32 numWords;
        bytes extraArgs;
    }

    event Requested(bytes32 indexed requestId, address indexed consumer);
    event Fulfilled(bytes32 indexed requestId, uint256[] randomWords);

    function requestRandomWords(RandomWordsRequest calldata req) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encode(msg.sender, block.number, nonce++));
        requests[requestId] = Request({
            consumer: msg.sender,
            keyHash: req.keyHash,
            callbackGasLimit: req.callbackGasLimit,
            requestConfirmations: req.requestConfirmations,
            numWords: req.numWords
        });
        emit Requested(requestId, msg.sender);
        return requestId;
    }

    /// @notice Test helper: fulfill with a supplied seed
    function fulfill(address consumer, bytes32 requestId, uint256 seed) external {
        uint32 n = requests[requestId].numWords;
        uint256[] memory words = new uint256[](n);
        for (uint32 i = 0; i < n; i++) {
            words[i] = uint256(keccak256(abi.encode(seed, i)));
        }
        IVRFV2PlusConsumer(consumer).rawFulfillRandomWords(requestId, words);
        emit Fulfilled(requestId, words);
    }
}
