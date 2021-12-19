// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract BithotelPair {

    //IUniswapV2Router02 private constant _ROUTER = IUniswapV2Router02(0x10ED43C718714eb63d5aA57B78B54704E256024E); //Pancakeswap MAINNET
    IUniswapV2Router02 private constant _ROUTER = IUniswapV2Router02(0xD99D1c33F9fC3444f8101754aBC46c52416550D1); //Pancakeswap TESTNET
    address private _routerAddress;
    IUniswapV2Pair private _pair;
    address private _pairAddress;
    address[] private _tokenPath = new address[](2);
    address[] private _wbscPath = new address[](2);

    address private _thisAddress;

     constructor() {
        _thisAddress = address(this);
        _routerAddress = address(_ROUTER);
        _pairAddress = IUniswapV2Factory(_ROUTER.factory()).createPair(_thisAddress, _ROUTER.WETH());
        _pair = IUniswapV2Pair(_pairAddress);
        _tokenPath[0] = _thisAddress;
        _tokenPath[1] = _ROUTER.WETH();
        _wbscPath[0] = _ROUTER.WETH();
        _wbscPath[1] = _thisAddress;
    }

    function routerAddress() public view returns(address) {
        return _routerAddress;
    }

    function pairAddress() public view returns(address) {
        return _pairAddress;
    }
}