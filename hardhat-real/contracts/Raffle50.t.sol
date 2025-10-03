// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/Raffle50.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract Raffle50Test is Test {
    VRFCoordinatorV2_5Mock coord;
    Raffle50 raffle;

    bytes32 constant KEYHASH = bytes32(uint256(0xabc)); // dummy
    uint32 constant GASLIMIT = 500_000;
    uint16 constant CONF = 5;

    function setUp() public {
        // baseFee, gasPrice, weiPerUnitLink
        coord = new VRFCoordinatorV2_5Mock(
            0.1 ether, // i_base_fee
            1e9, // i_gas_price
            4_000_000_000_000_000 // i_wei_per_unit_link (0.004 ether per LINK)
        );

        raffle = new Raffle50(address(coord));

        // Create + fund subscription, add raffle as consumer, tell raffle to use it
        uint256 subId = coord.createSubscription();
        coord.fundSubscriptionWithNative{value: 100 ether}(subId); // Fund with native ETH
        coord.addConsumer(subId, address(raffle));
        raffle.setVrfSubId(subId); // ensure Raffle50 exposes this setter
    }

    function _addEntrants(uint256 n) internal {
        for (uint256 i = 0; i < n; i++) {
            address user = address(uint160(i + 1));
            vm.prank(user);
            raffle.enter(); // pass empty proof
        }
    }

    function test_Revert_When_NotEnoughEntrants() public {
        _addEntrants(10);
        vm.expectRevert(bytes("not enough entrants"));
        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);
    }

    function test_HappyPath_Draw_And_Select_50_Winners() public {
        _addEntrants(300);

        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);
        uint256 reqId = raffle.vrfRequestId();
        assertEq(uint8(raffle.phase()), uint8(Raffle50.Phase.DrawRequested));

        uint256[] memory words = new uint256[](1);
        words[0] = uint256(keccak256("seed-1"));
        vm.prank(address(raffle.coordinator())); // Use the contract's coordinator reference
        raffle.rawFulfillRandomWords(reqId, words);

        assertEq(uint8(raffle.phase()), uint8(Raffle50.Phase.Drawn));
        assertEq(raffle.randomSeed(), words[0]);

        address[] memory winners = raffle.getWinners();
        for (uint256 i = 0; i < winners.length; i++) {
            for (uint256 j = i + 1; j < winners.length; j++) {
                assertTrue(winners[i] != winners[j], "duplicate winner");
            }
            assertTrue(raffle.isWinner(winners[i]), "isWinner false");
        }
    }

    function test_Claim_By_Winner_Succeeds() public {
        _addEntrants(300);

        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);
        uint256 reqId = raffle.vrfRequestId();

        uint256[] memory words = new uint256[](1);
        words[0] = 77;

        vm.prank(address(raffle.coordinator())); // Use the contract's coordinator reference
        raffle.rawFulfillRandomWords(reqId, words);

        address winner0 = raffle.getWinners()[0];

        vm.prank(winner0);
        raffle.claim();

        vm.prank(winner0);
        vm.expectRevert(bytes("already claimed"));
        raffle.claim();
    }

    function test_Claim_By_NonWinner_Reverts() public {
        _addEntrants(300);

        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);
        uint256 reqId = raffle.vrfRequestId();

        uint256[] memory words = new uint256[](1);
        words[0] = 999;
        vm.prank(address(raffle.coordinator())); // Use the contract's coordinator reference
        raffle.rawFulfillRandomWords(reqId, words);

        address nonWinner = address(0xBEEF);
        vm.prank(nonWinner);
        vm.expectRevert(bytes("not a winner"));
        raffle.claim();
    }

    function test_Request_Only_In_Enter_Phase() public {
        _addEntrants(300);
        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);

        vm.expectRevert(bytes("wrong phase"));
        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);
    }

    function test_Enter_After_DrawRequested_Reverts() public {
        _addEntrants(300);
        raffle.requestRandomness(KEYHASH, GASLIMIT, CONF,50);

        vm.prank(address(0x1234));
        vm.expectRevert(bytes("wrong phase"));
        raffle.enter();
    }
}
