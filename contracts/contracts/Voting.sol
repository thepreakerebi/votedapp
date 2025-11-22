// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Voting
 * @dev A decentralized voting contract that allows users to create proposals and vote on them.
 * @notice This contract enforces one vote per user per proposal and stores all data immutably on-chain.
 */
contract Voting is ReentrancyGuard {
    // ============ Structs ============
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 createdAt;
        uint256 voteCount;
    }
    
    struct Vote {
        address voter;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    
    Proposal[] public proposals;
    
    // Mapping: proposalId => array of voter addresses
    mapping(uint256 => address[]) public proposalVoters;
    
    // Mapping: proposalId => voter address => has voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Mapping: proposalId => array of votes (with timestamps)
    mapping(uint256 => Vote[]) public proposalVotes;
    
    // ============ Events ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        uint256 timestamp
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    /**
     * @dev Ensures proposal exists
     */
    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposals.length, "Voting: Proposal does not exist");
        _;
    }
    
    /**
     * @dev Ensures non-empty string input
     */
    modifier validString(string memory _str) {
        require(bytes(_str).length > 0, "Voting: String cannot be empty");
        _;
    }
    
    // ============ Write Functions ============
    
    /**
     * @dev Create a new proposal
     * @param _title The title of the proposal
     * @param _description The description/details of the proposal
     * @notice Proposals are immutable once created
     */
    function createProposal(
        string memory _title,
        string memory _description
    ) 
        external 
        nonReentrant
        validString(_title)
        validString(_description)
    {
        // Additional validation: prevent extremely long strings (gas optimization)
        require(bytes(_title).length <= 200, "Voting: Title too long");
        require(bytes(_description).length <= 2000, "Voting: Description too long");
        
        uint256 proposalId = proposals.length;
        
        proposals.push(
            Proposal({
                id: proposalId,
                title: _title,
                description: _description,
                creator: msg.sender,
                createdAt: block.timestamp,
                voteCount: 0
            })
        );
        
        emit ProposalCreated(proposalId, msg.sender, _title, block.timestamp);
    }
    
    /**
     * @dev Vote on a proposal
     * @param _proposalId The ID of the proposal to vote on
     * @notice Each user can only vote once per proposal
     */
    function vote(uint256 _proposalId) 
        external 
        nonReentrant
        proposalExists(_proposalId)
    {
        require(!hasVoted[_proposalId][msg.sender], "Voting: Already voted on this proposal");
        
        // Record the vote
        hasVoted[_proposalId][msg.sender] = true;
        proposals[_proposalId].voteCount++;
        proposalVoters[_proposalId].push(msg.sender);
        proposalVotes[_proposalId].push(Vote({
            voter: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit VoteCast(_proposalId, msg.sender, block.timestamp);
    }
    
    // ============ Read Functions ============
    
    /**
     * @dev Get total number of proposals
     * @return The total count of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
    
    /**
     * @dev Get a single proposal by ID
     * @param _proposalId The ID of the proposal
     * @return id Proposal ID
     * @return title Proposal title
     * @return description Proposal description
     * @return creator Address of proposal creator
     * @return createdAt Timestamp when proposal was created
     * @return voteCount Current vote count
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint256 createdAt,
            uint256 voteCount
        )
    {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.creator,
            proposal.createdAt,
            proposal.voteCount
        );
    }
    
    /**
     * @dev Get all proposals
     * @return Array of all proposals
     * @notice Use with caution for large datasets - consider pagination
     */
    function getAllProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
    
    /**
     * @dev Get proposals in a range (for pagination)
     * @param _start Starting index (inclusive)
     * @param _end Ending index (exclusive)
     * @return Array of proposals in the specified range
     */
    function getProposals(uint256 _start, uint256 _end) 
        external 
        view 
        returns (Proposal[] memory)
    {
        require(_start < proposals.length, "Voting: Start index out of bounds");
        require(_end <= proposals.length, "Voting: End index out of bounds");
        require(_start < _end, "Voting: Invalid range");
        
        uint256 length = _end - _start;
        Proposal[] memory result = new Proposal[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = proposals[_start + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all voters for a specific proposal
     * @param _proposalId The ID of the proposal
     * @return Array of voter addresses
     */
    function getProposalVoters(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (address[] memory)
    {
        return proposalVoters[_proposalId];
    }
    
    /**
     * @dev Get detailed vote information for a proposal
     * @param _proposalId The ID of the proposal
     * @return Array of Vote structs containing voter address and timestamp
     */
    function getProposalVotes(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (Vote[] memory)
    {
        return proposalVotes[_proposalId];
    }
    
    /**
     * @dev Check if a user has voted on a specific proposal
     * @param _proposalId The ID of the proposal
     * @param _user The address to check
     * @return True if user has voted, false otherwise
     */
    function hasUserVoted(uint256 _proposalId, address _user) 
        external 
        view 
        proposalExists(_proposalId)
        returns (bool)
    {
        return hasVoted[_proposalId][_user];
    }
    
    /**
     * @dev Get the winning proposal (highest vote count)
     * @return proposalId The ID of the winning proposal
     * @return voteCount The vote count of the winning proposal
     * @notice Returns the first proposal with highest votes if there's a tie
     */
    function getWinningProposal() external view returns (uint256 proposalId, uint256 voteCount) {
        require(proposals.length > 0, "Voting: No proposals exist");
        
        uint256 maxVotes = 0;
        uint256 winningId = 0;
        
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winningId = i;
            }
        }
        
        return (winningId, maxVotes);
    }
}

