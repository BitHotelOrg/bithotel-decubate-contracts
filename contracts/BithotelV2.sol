// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./DecubateWhitelisted.sol";

contract BithotelV2 is ERC20, DecubateWhitelisted {
  using SafeMath for uint256;

  address public constant DEAD_ADDRESS =
    0x000000000000000000000000000000000000dEaD;

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
  ) ERC20(name, symbol) DecubateWhitelisted(time, startTime, blockSellTime) {
    _mint(_msgSender(), initialSupply);
  }

  /**
   *
   * @dev lock tokens by sending to DEAD address
   *
   */
  function lockTokens(uint256 amount) external onlyOwner returns (bool) {
    _transfer(_msgSender(), DEAD_ADDRESS, amount);
    return true;
  }

  /**
   * @dev Destroys `amount` tokens from the caller.
   *
   * See {ERC20-_burn}.
   */
  function burn(uint256 amount) external onlyOwner returns (bool) {
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
    override
    notBlackListed(from, to)
    isTimeLocked(from, to)
    isSaleBlocked(from, to)
  {}
}