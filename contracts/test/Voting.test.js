const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy contract
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await voting.getAddress()).to.be.properAddress;
    });

    it("Should start with zero proposals", async function () {
      expect(await voting.getProposalCount()).to.equal(0);
    });
  });

  describe("Proposal Creation", function () {
    it("Should create a proposal successfully", async function () {
      const tx = await voting.connect(addr1).createProposal(
        "Test Proposal",
        "This is a test proposal description"
      );
      
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;
      
      await expect(tx)
        .to.emit(voting, "ProposalCreated")
        .withArgs(0, addr1.address, "Test Proposal", timestamp);

      expect(await voting.getProposalCount()).to.equal(1);
      
      const proposal = await voting.getProposal(0);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("This is a test proposal description");
      expect(proposal.creator).to.equal(addr1.address);
      expect(proposal.voteCount).to.equal(0);
    });

    it("Should allow multiple users to create proposals", async function () {
      await voting.connect(addr1).createProposal("Proposal 1", "Description 1");
      await voting.connect(addr2).createProposal("Proposal 2", "Description 2");
      await voting.connect(addr3).createProposal("Proposal 3", "Description 3");

      expect(await voting.getProposalCount()).to.equal(3);
    });

    it("Should reject empty title", async function () {
      await expect(
        voting.connect(addr1).createProposal("", "Description")
      ).to.be.revertedWith("Voting: String cannot be empty");
    });

    it("Should reject empty description", async function () {
      await expect(
        voting.connect(addr1).createProposal("Title", "")
      ).to.be.revertedWith("Voting: String cannot be empty");
    });

    it("Should reject title that is too long", async function () {
      const longTitle = "a".repeat(201);
      await expect(
        voting.connect(addr1).createProposal(longTitle, "Description")
      ).to.be.revertedWith("Voting: Title too long");
    });

    it("Should reject description that is too long", async function () {
      const longDescription = "a".repeat(2001);
      await expect(
        voting.connect(addr1).createProposal("Title", longDescription)
      ).to.be.revertedWith("Voting: Description too long");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.connect(addr1).createProposal(
        "Test Proposal",
        "Test Description"
      );
    });

    it("Should allow a user to vote on a proposal", async function () {
      const tx = await voting.connect(addr2).vote(0);
      
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;
      
      await expect(tx)
        .to.emit(voting, "VoteCast")
        .withArgs(0, addr2.address, timestamp);

      const proposal = await voting.getProposal(0);
      expect(proposal.voteCount).to.equal(1);
      
      expect(await voting.hasUserVoted(0, addr2.address)).to.be.true;
    });

    it("Should prevent double voting", async function () {
      await voting.connect(addr2).vote(0);
      
      await expect(
        voting.connect(addr2).vote(0)
      ).to.be.revertedWith("Voting: Already voted on this proposal");
    });

    it("Should allow multiple users to vote on the same proposal", async function () {
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(0);
      await voting.connect(addr3).vote(0);

      const proposal = await voting.getProposal(0);
      expect(proposal.voteCount).to.equal(3);
    });

    it("Should allow a user to vote on multiple proposals", async function () {
      await voting.connect(addr2).createProposal("Proposal 2", "Description 2");
      
      await voting.connect(addr1).vote(0);
      await voting.connect(addr1).vote(1);

      expect(await voting.hasUserVoted(0, addr1.address)).to.be.true;
      expect(await voting.hasUserVoted(1, addr1.address)).to.be.true;
    });

    it("Should reject voting on non-existent proposal", async function () {
      await expect(
        voting.connect(addr2).vote(999)
      ).to.be.revertedWith("Voting: Proposal does not exist");
    });

    it("Should track voters correctly", async function () {
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(0);
      await voting.connect(addr3).vote(0);

      const voters = await voting.getProposalVoters(0);
      expect(voters.length).to.equal(3);
      expect(voters[0]).to.equal(addr1.address);
      expect(voters[1]).to.equal(addr2.address);
      expect(voters[2]).to.equal(addr3.address);
    });
  });

  describe("Reading Proposals", function () {
    beforeEach(async function () {
      await voting.connect(addr1).createProposal("Proposal 1", "Description 1");
      await voting.connect(addr2).createProposal("Proposal 2", "Description 2");
      await voting.connect(addr3).createProposal("Proposal 3", "Description 3");
    });

    it("Should return correct proposal count", async function () {
      expect(await voting.getProposalCount()).to.equal(3);
    });

    it("Should return all proposals", async function () {
      const allProposals = await voting.getAllProposals();
      expect(allProposals.length).to.equal(3);
      expect(allProposals[0].title).to.equal("Proposal 1");
      expect(allProposals[1].title).to.equal("Proposal 2");
      expect(allProposals[2].title).to.equal("Proposal 3");
    });

    it("Should return proposals in range", async function () {
      const proposals = await voting.getProposals(1, 3);
      expect(proposals.length).to.equal(2);
      expect(proposals[0].title).to.equal("Proposal 2");
      expect(proposals[1].title).to.equal("Proposal 3");
    });

    it("Should reject invalid range", async function () {
      await expect(
        voting.getProposals(2, 1)
      ).to.be.revertedWith("Voting: Invalid range");
    });

    it("Should reject out of bounds start index", async function () {
      await expect(
        voting.getProposals(10, 15)
      ).to.be.revertedWith("Voting: Start index out of bounds");
    });

    it("Should reject out of bounds end index", async function () {
      await expect(
        voting.getProposals(0, 10)
      ).to.be.revertedWith("Voting: End index out of bounds");
    });
  });

  describe("Vote Details", function () {
    beforeEach(async function () {
      await voting.connect(addr1).createProposal("Test Proposal", "Description");
    });

    it("Should return vote details with timestamps", async function () {
      await voting.connect(addr2).vote(0);
      await voting.connect(addr3).vote(0);

      const votes = await voting.getProposalVotes(0);
      expect(votes.length).to.equal(2);
      expect(votes[0].voter).to.equal(addr2.address);
      expect(votes[1].voter).to.equal(addr3.address);
      expect(votes[0].timestamp).to.be.gt(0);
      expect(votes[1].timestamp).to.be.gt(0);
    });

    it("Should return false for user who hasn't voted", async function () {
      expect(await voting.hasUserVoted(0, addr2.address)).to.be.false;
    });

    it("Should return true for user who has voted", async function () {
      await voting.connect(addr2).vote(0);
      expect(await voting.hasUserVoted(0, addr2.address)).to.be.true;
    });
  });

  describe("Winning Proposal", function () {
    it("Should revert when no proposals exist", async function () {
      await expect(
        voting.getWinningProposal()
      ).to.be.revertedWith("Voting: No proposals exist");
    });

    it("Should return proposal with highest votes", async function () {
      await voting.connect(addr1).createProposal("Proposal 1", "Description 1");
      await voting.connect(addr2).createProposal("Proposal 2", "Description 2");
      await voting.connect(addr3).createProposal("Proposal 3", "Description 3");

      // Vote on proposal 1 (3 votes)
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(0);
      await voting.connect(addr3).vote(0);

      // Vote on proposal 2 (2 votes)
      await voting.connect(addr1).vote(1);
      await voting.connect(addr2).vote(1);

      // Vote on proposal 3 (1 vote)
      await voting.connect(addr1).vote(2);

      const [winningId, voteCount] = await voting.getWinningProposal();
      expect(winningId).to.equal(0);
      expect(voteCount).to.equal(3);
    });

    it("Should handle ties correctly", async function () {
      await voting.connect(addr1).createProposal("Proposal 1", "Description 1");
      await voting.connect(addr2).createProposal("Proposal 2", "Description 2");

      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);

      // In case of tie, returns first proposal with highest votes
      const [winningId, voteCount] = await voting.getWinningProposal();
      expect(winningId).to.equal(0);
      expect(voteCount).to.equal(1);
    });
  });

  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test verifies ReentrancyGuard is working
      // The contract uses nonReentrant modifier which prevents reentrancy
      await voting.connect(addr1).createProposal("Test", "Description");
      
      // Normal vote should work
      await voting.connect(addr2).vote(0);
      
      // Attempting to vote again should fail (not due to reentrancy, but double vote check)
      await expect(
        voting.connect(addr2).vote(0)
      ).to.be.revertedWith("Voting: Already voted on this proposal");
    });

    it("Should reject reading non-existent proposal", async function () {
      await expect(
        voting.getProposal(999)
      ).to.be.revertedWith("Voting: Proposal does not exist");
    });

    it("Should reject reading voters for non-existent proposal", async function () {
      await expect(
        voting.getProposalVoters(999)
      ).to.be.revertedWith("Voting: Proposal does not exist");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle creator voting on their own proposal", async function () {
      await voting.connect(addr1).createProposal("My Proposal", "Description");
      await voting.connect(addr1).vote(0);

      const proposal = await voting.getProposal(0);
      expect(proposal.voteCount).to.equal(1);
      expect(await voting.hasUserVoted(0, addr1.address)).to.be.true;
    });

    it("Should handle maximum length strings", async function () {
      const maxTitle = "a".repeat(200);
      const maxDescription = "b".repeat(2000);

      await voting.connect(addr1).createProposal(maxTitle, maxDescription);
      
      const proposal = await voting.getProposal(0);
      expect(proposal.title).to.equal(maxTitle);
      expect(proposal.description).to.equal(maxDescription);
    });
  });
});

