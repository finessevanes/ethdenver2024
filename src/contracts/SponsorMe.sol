// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@api3/contracts/v0.8/interfaces/IProxy.sol";

pragma solidity ^0.8.20;

contract SponsorMe is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    // struct of a donation
    struct Donation {
        uint256 maxSupply;
        uint256 currentSupply;
        string donationURI;
    }

    enum SponsorLevel {
        GOLD,
        SILVER,
        BRONZE,
        WAGMI
    }

    Donation[4] public donations;

    event DonationReceived(address donor, SponsorLevel level);
    event GeneralDonationReceived(address donor, uint256 amount);

    // Sat Mar 09 2024 11:00:00 GMT-0700 (Mountain Standard Time)
    uint256 public donationDeadline = 1710007200;

    // Sat Mar 09 2024 12:00:00 GMT-0700 (Mountain Standard Time)
    uint256 public fundTransferTime = 1710010800;

    // send to finessevanes.eth
    address payable private constant withdrawAddress =
        payable(0x9150C94dE175C6FA4d766a4e951E9c7ed204Ad1a);

    // proxy address for price api3 oracle eth/usd
    address public proxyAddress = 0x009E9B1eec955E9Fe7FE64f80aE868e661cb4729;

    // Define constant USD values for each SponsorLevel
    uint256 constant GOLD_PRICE_USD = 100;
    uint256 constant SILVER_PRICE_USD = 50;
    uint256 constant BRONZE_PRICE_USD = 25;
    uint256 constant WAGMI_PRICE_USD = 5;

    // from openzepellin wizard
    uint256 private tokenIdCount;

    mapping(SponsorLevel => string) private levelURIs;

    constructor() ERC721("SponsorMe", "RUNLA") Ownable(msg.sender) {
        // gold sponsorship
        donations[0] = Donation(2, 0, '{"name":"Gold Tier","description":"You\'re a real one. You get PRIME real estate. Thank you for helping me get to the 2024 LA Marathon!","image":"https://gateway.pinata.cloud/ipfs/QmQTb4rCcskPMv5c841UFCXmBZN2hvYjTAYXrN95WLjgmH"}');
        // silver sponsorship
        donations[1] = Donation(4, 0, '{"name":"Silver Tier","description":"You like to be seen, but not the center of attention. Thank you for helping me get to the 2024 LA Marathon!","image":"https://gateway.pinata.cloud/ipfs/QmbtUsieW59jFbfbyFcCKR49n55Sq7uauPtx9xA2Hqo7Qo"}');
        // bronze sponsorship
        donations[2] = Donation(10, 0, '{"name":"Bronze Tier","description":"You\'re so special, there\'s 9 others just like you. Thank you for helping me get to the 2024 LA Marathon!","image":"https://gateway.pinata.cloud/ipfs/QmegDosswXcngqgpa17tf8Ja4s4AUK7fVPRPfEMgqdPRE6"}');
        // wagmi sponsorship
        donations[3] = Donation(type(uint256).max, 0, '{"name":"WAGMI Tier","description":"gm, degen. Thank you for helping me get to the 2024 LA Marathon!","image":"https://gateway.pinata.cloud/ipfs/Qmcw6oUCVta2JbM3iqyWBpCMpskUsLU2BgZUkkr21g8R7m"}');
    }

    // function for makeGoldDonation, makeSilverDonation, makeBronzeDonation, makeWagmiDonation

    function makeDonation(SponsorLevel level, address to) public payable {
        // grab the donation object that is being purchased
        uint256 requiredEthAmount;
        if (level == SponsorLevel.GOLD) {
            requiredEthAmount = usdToEth(GOLD_PRICE_USD);
        } else if (level == SponsorLevel.SILVER) {
            requiredEthAmount = usdToEth(SILVER_PRICE_USD);
        } else if (level == SponsorLevel.BRONZE) {
            requiredEthAmount = usdToEth(BRONZE_PRICE_USD);
        } else {
            // WAGMI
            // For WAGMI, set the minimum to $5 USD equivalent in ETH
            requiredEthAmount = usdToEth(WAGMI_PRICE_USD);
        }

        // Ensure the sent amount of ETH meets or exceeds the required amount for the selected level
        // For WAGMI, this checks for a minimum of $5 USD equivalent in ETH
        require(
            msg.value >= requiredEthAmount,
            "Donation does not meet the minimum required amount in USD."
        );

        Donation storage donation = donations[uint256(level)];

        // require that the current supply is still less than max supply 3 < 4
        require(donation.currentSupply < donations[uint256(level)].maxSupply);
        // require that current time is not passed
        require(
            block.timestamp < donationDeadline,
            "no loger accepting donations"
        );

        donation.currentSupply += 1;

        _safeMint(to, tokenIdCount);
        _setTokenURI(tokenIdCount, string.concat("data:application/json;utf8,", donation.donationURI));
        tokenIdCount++;
        emit DonationReceived(msg.sender, level);
    }

    function airDrop(address to, SponsorLevel level) public onlyOwner {
        Donation storage donation = donations[uint256(level)];

        // require that the current supply is still less than max supply 3 < 4
        require(donation.currentSupply < donations[uint256(level)].maxSupply);
        // require that current time is not passed
        require(
            block.timestamp < donationDeadline,
            "no loger accepting donations"
        );

        donation.currentSupply += 1;

        _safeMint(to, tokenIdCount);
        _setTokenURI(tokenIdCount, string.concat("data:application/json;utf8,", donation.donationURI));
        tokenIdCount++;
    }

    function withdrawFunds() external onlyOwner {
        // commenting out for the sake of testing
        // require(block.timestamp >= fundTransferTime, "Funds are locked until __");
        uint256 _balance = address(this).balance;
        (bool success, ) = withdrawAddress.call{value: _balance}("");
        // require(success, "Transfer failed.");
        require(success, "Transfer failed");
    }

    // if someone send the contract funds, then a general donation event will be emitted
    receive() external payable {
        emit GeneralDonationReceived(msg.sender, msg.value);
    }

    function readDataFeed()
        internal
        view
        returns (int224 value, uint256 timestamp)
    {
        // Use the IProxy interface to read a dAPI via its
        // proxy contract .
        (value, timestamp) = IProxy(proxyAddress).read();
        // If you have any assumptions about value and timestamp,
        // make sure to validate them after reading from the proxy.
    }

    function donationsLeft(SponsorLevel level) public view returns (uint256) {
        Donation storage donation = donations[uint256(level)];
        return donation.maxSupply - donation.currentSupply;
    }

    function usdToEth(uint256 usdAmount) public view returns (uint256) {
        // Get the latest ETH/USD price
        (int224 ethUsdPrice, ) = readDataFeed();
        require(
            ethUsdPrice >= 0,
            "ETH price is negative, conversion not possible."
        );

        // First, safely convert int224 to int256, and then to uint256
        uint256 ethPrice = uint256(int256(ethUsdPrice));

        // Convert USD amount to ETH amount (assuming price is in 1e8 format, adjust if different)
        // Make sure to multiply before dividing to avoid precision loss
        uint256 ethAmountWei = (usdAmount * 1e18 * 1e8) / ethPrice;

        return ethAmountWei;
    }

// The following functions are overrides required by Solidity.

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(
    address account,
    uint128 value
  ) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
