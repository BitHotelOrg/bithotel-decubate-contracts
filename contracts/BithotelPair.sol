// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract BithotelPair {

    address private constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;// BUSD MAINNET 0xe9e7cea3dedca5984780bafc599bd69add087d56

    IUniswapV2Router02 private constant _ROUTER = IUniswapV2Router02(0x10ED43C718714eb63d5aA57B78B54704E256024E); //Pancakeswap MAINNET
    address private _routerAddress;
    IUniswapV2Pair private _pair;
    address private _pairAddress;
    address private _thisAddress;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

     constructor() {
        _thisAddress = address(this);
        _routerAddress = address(_ROUTER);
        _pairAddress = IUniswapV2Factory(_ROUTER.factory()).createPair(_thisAddress, BUSD);
        _pair = IUniswapV2Pair(_pairAddress); 
    }

    function routerAddress() public view returns(address) {
        return _routerAddress;
    }

    function pairAddress() public view returns(address) {
        return _pairAddress;
    }
}