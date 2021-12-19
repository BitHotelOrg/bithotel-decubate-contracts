// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./DecubateWhitelisted.sol";

import "./token/ERC20/utils/ERC20Fallback.sol";

contract Bithotel is AccessControl, ERC20, DecubateWhitelisted, ERC20Fallback {
    using SafeMath for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
    *
    * @dev mint initialSupply in constructor with symbol and name
    *
    */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 time,
        uint256 startTime,
        uint256 blockSellTime
    ) 
        ERC20(name, symbol) 
        DecubateWhitelisted(time, startTime, blockSellTime) 
        ERC20Fallback()
    {
        _setupRole(ADMIN_ROLE, _msgSender());
        _mint(_msgSender(), initialSupply);
    }

    /**
    * @dev Destroys `amount` tokens from the caller.
    *
    * See {ERC20-_burn}.
    */
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

    /**
    * @dev Validation of an fallback redeem. Use require statements to revert state when conditions are not met.
    * @param token_ The token address of IERC20 token
    * @param to_ Address performing the token deposit
    * @param amount_ Number of tokens deposit
    *
    * Requirements:
    *
    * - `msg.sender` must be owner.
    * - `token` cannot be the zero address.
    * - `to` cannot be the zero address.
    * - this address must have a token balance of at least `amount`.
    * - must be admin
    */
    function _prevalidateFallbackRedeem(IERC20 token_,  address to_, uint256 amount_) 
        internal 
        virtual
        override
        view
        onlyRole(ADMIN_ROLE) 
    {
        super._prevalidateFallbackRedeem(token_, to_, amount_);
    }

    /**
    * @dev Hook that is called before any transfer of tokens. This includes
    * minting and burning.
    *
    * Calling conditions:
    *
    * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
    * will be to transferred to `to`.
    * - when `from` is zero, `amount` tokens will be minted for `to`.
    * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
    * - `from` and `to` are never both zero.
    *
    */
    function _beforeTokenTransfer(
      address from,
      address to,
      uint256 amount
    )
      internal
      override
      notBlackListed(from, to)
      isTimeLocked(from, to)
      isSaleBlocked(from, to)
    {}
}