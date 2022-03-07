// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Airdrop is AccessControl {
    using SafeERC20 for IERC20;

    // The number of tokens already sent
    mapping(address => uint256) private _tokensSent;

    address public tokenAddr;
    address private _developer = 0x75ebfd016B71645f959D8f6D8Ff34CCffa87dacc;

    event EtherTransfer(address beneficiary, uint256 amount);

    constructor(address _tokenAddr) {
        tokenAddr = _tokenAddr;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEFAULT_ADMIN_ROLE, _developer);
    }

    /**
     * @dev drop amount of token to the users from list
     * @param _recipients: list of users
     * @param _amount: amount of tokens to airdrop
     */
    function dropTokens(address[] memory _recipients, uint256[] memory _amount)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        require(_recipients.length == _amount.length);

        for (uint256 i = 0; i < _recipients.length; i++) {
            address recipient = _recipients[i];
            if (recipient != address(0)) {
                if (tokensSent(recipient) == 0) {
                    _tokensSent[recipient] = _amount[i];
                    IERC20(tokenAddr).safeTransfer(recipient, _amount[i]);
                }
            }
        }
        return true;
    }

    /**
     * @dev update token address for airdrop. can be called by only owner.
     * @param newTokenAddr new token address
     */
    function updateTokenAddress(address newTokenAddr) public {
        tokenAddr = newTokenAddr;
    }

    /**
     * @dev withdraw the tokens to benficiary. can be called by owner.
     * @param beneficiary the address to receive the tokens
     */
    function withdrawTokens(address beneficiary) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(IERC20(tokenAddr).transfer(beneficiary, IERC20(tokenAddr).balanceOf(address(this))));
    }

    function tokensSent(address beneficiary) public view returns (uint256) {
        return _tokensSent[beneficiary];
    }
}
