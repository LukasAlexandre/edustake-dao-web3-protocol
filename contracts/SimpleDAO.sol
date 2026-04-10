// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDAO {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        address proposer;
    }

    IERC20 public immutable eduToken;
    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token");
        eduToken = IERC20(tokenAddress);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 durationInSeconds
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title is required");
        require(durationInSeconds > 0, "Duration must be greater than zero");
        require(eduToken.balanceOf(msg.sender) > 0, "Only token holders can propose");

        proposalCount += 1;
        uint256 deadline = block.timestamp + durationInSeconds;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: title,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            deadline: deadline,
            executed: false,
            proposer: msg.sender
        });

        emit ProposalCreated(proposalCount, msg.sender, deadline);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp < proposal.deadline, "Voting period has ended");
        require(!hasVoted[proposalId][msg.sender], "User has already voted");

        uint256 votingPower = eduToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }

        emit Voted(proposalId, msg.sender, support, votingPower);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.deadline, "Voting period still active");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;

        emit ProposalExecuted(proposalId, proposal.yesVotes > proposal.noVotes);
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        Proposal memory proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        return proposal;
    }
}
