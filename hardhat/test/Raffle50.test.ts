import { expect } from "chai";
import { ethers } from "hardhat";

const MAX_ENTRANTS = 300;
const MAX_WINNERS = 50;

describe("Raffle50 (open entry)", function () {
  async function deployFixture() {
    const [owner, alice, bob, ...rest] = await ethers.getSigners();

    // Deploy mock coordinator
    const Mock = await ethers.getContractFactory("MockVRFCoordinatorV2Plus");
    const mock = await Mock.deploy();

    // Deploy raffle with mock coordinator address
    const Raffle = await ethers.getContractFactory("Raffle50");
    const raffle = await Raffle.deploy(await mock.getAddress());

    return { owner, alice, bob, others: rest, mock, raffle };
  }

  it("allows unique addresses to enter until capped", async () => {
    const { raffle, others } = await deployFixture();

    await expect(raffle.connect(others[0]).enter([])).to.emit(raffle, "Enter");

    await expect(raffle.connect(others[0]).enter([])).to.be.revertedWith(
      "already entered"
    );

    for (let i = 1; i < MAX_ENTRANTS; i++) {
      await raffle.connect(others[i]).enter([]);
    }

    expect(await raffle.entrantsCount()).to.equal(MAX_ENTRANTS);

    await expect(
      raffle.connect(others[MAX_ENTRANTS]).enter([])
    ).to.be.revertedWith("entries full");
  });

  it("owner can request randomness only after >=50 entrants", async () => {
    const { raffle, owner, others } = await deployFixture();

    for (let i = 0; i < 10; i++) await raffle.connect(others[i]).enter([]);

    await expect(
      raffle.connect(owner).requestRandomness(ethers.ZeroHash, 300_000, 5)
    ).to.be.revertedWith("need >= 50 entrants");

    for (let i = 10; i < 50; i++) await raffle.connect(others[i]).enter([]);

    await expect(
      raffle.connect(owner).requestRandomness(ethers.ZeroHash, 300_000, 5)
    ).to.emit(raffle, "DrawRequested");

    expect(await raffle.phase()).to.equal(1); // DrawRequested
  });

  it("non-owner cannot request randomness", async () => {
    const { raffle, others } = await deployFixture();

    for (let i = 0; i < 60; i++) await raffle.connect(others[i]).enter([]);

    await expect(
      raffle.connect(others[0]).requestRandomness(ethers.ZeroHash, 300_000, 5)
    ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
  });

  it("selects 50 unique winners deterministically on fulfill", async () => {
    const { raffle, mock, owner, others } = await deployFixture();

    for (let i = 0; i < 120; i++) await raffle.connect(others[i]).enter([]);

    await raffle.connect(owner).requestRandomness(ethers.ZeroHash, 300_000, 5);
    const requestId = await raffle.vrfRequestId();

    await mock.fulfill(await raffle.getAddress(), requestId, 123456789n);

    expect(await raffle.phase()).to.equal(2); // Drawn
    expect(await raffle.winnersCount()).to.equal(MAX_WINNERS);

    const winners = await raffle.getWinners();
    const set = new Set(winners.map((w: string) => w.toLowerCase()));
    expect(set.size).to.equal(MAX_WINNERS);

    for (const w of winners) {
      const entered = await raffle.isEntrant(w);
      expect(entered).to.equal(true);
    }
  });

  it("claim works only for winners and only once; non-winners revert", async () => {
    const { raffle, mock, owner, others } = await deployFixture();

    for (let i = 0; i < 80; i++) await raffle.connect(others[i]).enter([]);

    await raffle.connect(owner).requestRandomness(ethers.ZeroHash, 300_000, 5);
    const requestId = await raffle.vrfRequestId();
    await mock.fulfill(await raffle.getAddress(), requestId, 42n);

    const winners = await raffle.getWinners();
    const winner = winners[0];
    const loser = others[79].address;

    await expect(
      raffle.connect(await ethers.getSigner(winner)).claim()
    ).to.emit(raffle, "Claimed");

    await expect(
      raffle.connect(await ethers.getSigner(winner)).claim()
    ).to.be.revertedWith("already claimed");

    if (!(await raffle.isWinner(loser))) {
      await expect(
        raffle.connect(await ethers.getSigner(loser)).claim()
      ).to.be.revertedWith("not a winner");
    }
  });

  it("cannot claim before draw", async () => {
    const { raffle, others } = await deployFixture();

    await raffle.connect(others[0]).enter([]);
    await expect(raffle.connect(others[0]).claim()).to.be.revertedWith(
      "wrong phase"
    );
  });
});
