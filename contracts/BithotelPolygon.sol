// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./token/ERC20/utils/ERC20Fallback.sol";

contract BithotelChild is AccessControl, ERC20Capped, ERC20Fallback {
    using SafeMath for uint256;

    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
    bytes32 public constant BLACKLISTED_ROLE = keccak256("BLACKLISTED_ROLE");
    
    address private _childChainManagerProxy = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa; //matic mainnet

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
      _setupRole(DEPOSITOR_ROLE, childChainManagerProxy());
    }

    //-------------------------------------------------------------------------------------------
    //Matic Child Functions 
    //-------------------------------------------------------------------------------------------

    /**
     * @notice called when token is deposited on root chain
     * @dev Should be callable only by ChildChainManager
     * Should handle deposit by minting the required amount for user
     * Make sure minting is done only by this function
     * @param user user address for whom deposit is being done
     * @param depositData abi encoded amount
     */

    function deposit(address user, bytes calldata depositData)
        external
        onlyRole(DEPOSITOR_ROLE)
    {
        uint256 amount = abi.decode(depositData, (uint256));
        _mint(user, amount);
    }

    /**
     * @notice called when user wants to withdraw tokens back to root chain
     * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
     * @param amount amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external {
        _burn(_msgSender(), amount);
    }

    /**
     * @notice Example function to handle minting tokens on matic chain
     * @dev Minting can be done as per requirement,
     * This implementation allows only admin to mint tokens but it can be changed as per requirement
     * @param user user for whom tokens are being minted
     * @param amount amount of token to mint
     */
    function mint(address user, uint256 amount) public onlyRole(DEPOSITOR_ROLE) {
        _mint(user, amount);
    }

    function childChainManagerProxy() public view returns(address) {
        return _childChainManagerProxy;
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