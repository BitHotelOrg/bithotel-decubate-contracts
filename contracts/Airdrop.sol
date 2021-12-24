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
    address private _developer = 0x0A0cfF108658bFeC76284b71C192244BA47E9C2F;

    address public pairaddress = 0xBa97D1d463190e415429C2897BBDC66c739BBa96;
    address public vestingAddress = 0x235208A31093aE3B2017976CC4D5A03683141fa9;
    address public superLauncher = 0x25E3AC5509678e4b3FFf004824B74DDeC4799cb1;
    address public bram = 0xd00941011FC01012ab2090fa6266100f5C3269eD;

    event EtherTransfer(address beneficiary, uint amount);
    
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
    function dropTokens(address[] memory _recipients, uint256[] memory _amount) public onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        require(_recipients.length == _amount.length);

        for (uint i = 0; i < _recipients.length; i++) {
            address recipient = _recipients[i];
            if (
                recipient != pairaddress &&
                recipient != vestingAddress && 
                recipient != superLauncher &&
                recipient != bram &&
                recipient != address(0)) {
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

    function tokensSent(address beneficiary) public view returns(uint256) {
        return _tokensSent[beneficiary];
    }
}