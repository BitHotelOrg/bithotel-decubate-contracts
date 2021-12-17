// SPDX-License-Identifier: MIT

//** Decubate ERC20 TOKEN for Mainnet */
//** Author Vipin */

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./token/ERC20/utils/ERC20Fallback.sol";

contract Bithotel is AccessControl, ERC20Capped, ERC20Fallback {
    using SafeMath for uint256;

    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
    bytes32 public constant BANNEDLISTED_ROLE = keccak256("BANNEDLISTED_ROLE");

    uint256 public startTime;
    uint256 public blockSellUntil;

    bool public isTimeLockEnabled;
    address public pairAddress;

    event TimeLockEnabled(bool value);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 supplyCap,
        uint256 time,
        uint256 _startTime,
        uint256 _blockSellUntil
    ) 
        ERC20(name, symbol)
        ERC20Capped(supplyCap)
        ERC20Fallback()
    {
        isTimeLockEnabled = true;
        startTime = _startTime + time;
        blockSellUntil = _blockSellUntil;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _mint(_msgSender(), initialSupply);
    }

    //Modifier which controls transfer on a set time period
    modifier isTimeLocked(address from, address to) {
        if (isTimeLockEnabled) {
            if(hasRole(DEFAULT_ADMIN_ROLE, from) || hasRole(DEFAULT_ADMIN_ROLE, to) ) {
                require(block.timestamp >= startTime, "Bithotel: Trading not enabled yet");
            }
        }
        _;
    }

    //Modifier which blocks sell until blockSellUntil value
    modifier isSaleBlocked(address from, address to) {
        if(hasRole(DEFAULT_ADMIN_ROLE, from) || hasRole(DEFAULT_ADMIN_ROLE, to) ) {
            require(block.timestamp >= blockSellUntil, "Bithotel: Sell disabled!");
        }
        _;
    }

    /**
    *
    * @dev Include/Exclude multiple address in blacklist
    *
    * @param {addr} Address array of users
    * @param {value} Whitelist status of users
    *
    * @return {bool} Status of bulk ban list
    *
    */
    function bulkBannedList(address[] calldata addr)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        uint256 len = addr.length;
        for (uint256 i = 0; i < len; i++) {
            _setupRole(BANNEDLISTED_ROLE, addr[i]);
        }
        return true;
    }

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
    *
    * @dev Set pairAddress
    *
    * @param {addr} address of pancakswap liquidity pair
    *
    * @return {bool} Status of operation
    *
    */
    function setPairAddress(address addr)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        pairAddress = addr;
        return true;
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
     * @notice Example function to handle minting tokens on matic chain
     * @dev Minting can be done as per requirement,
     * This implementation allows only admin to mint tokens but it can be changed as per requirement
     * @param user user for whom tokens are being minted
     * @param amount amount of token to mint
     */
    function mint(address user, uint256 amount) public onlyRole(DEPOSITOR_ROLE) {
        _mint(user, amount);
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
      // solhint-disable-next-line no-unused-vars
      uint256 amount
    )
      internal
      virtual
      override
      isTimeLocked(from, to)
      isSaleBlocked(from, to)
    {
        if(hasRole(BANNEDLISTED_ROLE, from)) {
            revert("Bithotel: from address banned");
        } else if (hasRole(BANNEDLISTED_ROLE, to)) {
            revert("Bithotel: to address banned");
        }
    }
}