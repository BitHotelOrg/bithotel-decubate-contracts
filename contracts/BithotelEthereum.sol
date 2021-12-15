// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./token/ERC20/utils/ERC20Fallback.sol";

contract BithotelRoot is AccessControl, ERC20Capped, ERC20Fallback {
    using SafeMath for uint256;

    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");
    bytes32 public constant BLACKLISTED_ROLE = keccak256("BLACKLISTED_ROLE");
    
    address private _predicateProxy = 0x9923263fA127b3d1484cFD649df8f1831c2A74e4; //ETH mainnet

    /**
    *
    * @dev mint initialSupply in constructor with symbol and name
    *
    */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 supplyCap
    ) 
        ERC20(name, symbol)
        ERC20Capped(supplyCap)
        ERC20Fallback()
    {
        _mint(_msgSender(), initialSupply);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PREDICATE_ROLE, predicateProxy());
    }

    /**
     * @dev See {IMintableERC20-mint}.
     */
    function mint(address user, uint256 amount) external onlyRole(PREDICATE_ROLE) {
        _mint(user, amount);
    }

    function predicateProxy() public view returns(address) {
        return _predicateProxy;
    }

    /**
    * @dev Validation of an fallback redeem. Use require statements to revert state when conditions are not met.
    * Use `super` in contracts that inherit from TokenEscrow to extend their validations.
    * Example from TokenEscrow.sol's _prevalidateFallbackRedeem method:
    *     super._prevalidateFallbackRedeem(token, payee, amount);
    *    
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
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        super._prevalidateFallbackRedeem(token_, to_, amount_);
    }

    /**
    *
    * @dev lock tokens by sending to DEAD address
    *
    */
    function lockTokens(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        _transfer(_msgSender(), DEAD_ADDRESS, amount);
        return true;
    }

    /**
    * @dev Destroys `amount` tokens from the caller.
    *
    * See {ERC20-_burn}.
    */
    function burn(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        _burn(_msgSender(), amount);
        return true;
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
        virtual
        override
        view
    {
        require(!hasRole("BLACKLISTED_ROLE", from), "Bithotel: from address banned");
        require(!hasRole("BLACKLISTED_ROLE", to), "Bithotel: to address banned");
    }
}