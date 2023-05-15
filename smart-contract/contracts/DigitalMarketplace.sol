// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalMarketplace is Ownable{

    //Use safemath for ensuring the security
    using SafeMath for uint256;

    //When the products sale successfully, marketplace owner receives some money regarding this platform fee.
    //Generally, it can't be more than 10%.
    uint256 public platformFee;

    //Struct for products.
    struct Item {
        string name; 
        string description;
        string uri; // uri for image of product uploaded to IPFS.
        uint256 price; // price per product (sun = 1e-6 TRX)
        address owner; // owner of the product
        bool isForSale; // true if been listed marketplace
    }

    /**
    * @dev Set platform fee when you deploy smart contract with prededined 'platformFee' (decimal=3).
    */
    constructor (
        uint256 _platformFee
    ) {
        require(_platformFee <= 10000, "The platform fee can't be more than 10 percent");
        platformFee = _platformFee;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    event ItemListed(uint256 indexed itemId, string indexed name, string description, string uri, uint256 price, address indexed owner);
    event ItemPurchased(uint256 indexed itemId, address indexed buyer, address indexed seller);
    event ItemTransferred(uint256 indexed itemId, address indexed newOwner);
    event FundsWithdrawn(address indexed owner, uint256 indexed amount);
    
    receive() external payable {}
    fallback() external payable {}
    
    /**
    *   @dev Add the new product with predefined 'name', 'description', 'uri', 'price' to the marketplace
    *   @param _name name of the product
    *   @param _description simple description of product
    *   @param _uri uri of product (avatar)
    *   @param _price the price of product represented sun (1000000 sun=1 TRX)
    *   
    *   Emits a {ItemListed} event.
    */
    function listNewItem(
        string memory _name, 
        string memory _description, 
        string memory _uri, 
        uint256 _price
    ) public {
        require(_price > 0, "Price can't be negative");
        items[itemCount] = Item(_name, _description, _uri, _price, msg.sender, true);
        itemCount = itemCount.add(1);
        emit ItemListed(itemCount, _name, _description, _uri, _price, msg.sender);
    }

    /**
    *   @dev purchase the product sending the TRX to the owner.
    *   @param _itemId index of the product listed in marketplace.
    *   
    *   Emits a {ItemPurchased} event.
    */
    function purchaseItem(
        uint256 _itemId
    ) public payable {
        require(items[_itemId].isForSale == true, "Item is not for sale");
        require(msg.value >= items[_itemId].price, "Insufficient funds");
        require(msg.sender != items[_itemId].owner, "Can not transfer TRX to the same address");

        address payable seller = payable(items[_itemId].owner);
        
        //Calculate & Transfer platform fee
        uint256 platformFeeTotal = calculatePlatformFee(items[_itemId].price);
        // payable(address(this)).transfer(platformFeeTotal);

        //Transfer to the seller
        seller.transfer(msg.value - platformFeeTotal);

        emit ItemPurchased(_itemId, msg.sender, seller);

        items[_itemId].isForSale = false;
        //change the owner of the product to msg.sender
        items[_itemId].owner = msg.sender;
    }

    /**
    *   @dev Transfer the ownership of product to the specified address without receiving the TRX.
    *   @param _itemId index of the product listed in marketplace for transfering the ownership.
    *   @param _newOwner new Owner of the product.
    *
    *   Emits a {ItemTransferred} event.
    */
    function transferItemOwnership(
        uint256 _itemId, 
        address _newOwner
    ) public {
        require(items[_itemId].owner == msg.sender, "You are not the owner of the item");

        items[_itemId].owner = _newOwner;

        emit ItemTransferred(_itemId, _newOwner);
    }

    /**
    *   @dev Withdraw TRX from this smart contract to the owner of marketplace.
    *
    *   Emits a {FundsWithdrawn} event.
    */
    function withdrawFunds() public onlyOwner{
        uint256 balance = address(this).balance;

        require(balance > 0, "No funds available for withdrawal");
        
        address payable owner = payable(msg.sender);
        owner.transfer(balance);

        emit FundsWithdrawn(msg.sender, balance);
    }
    
    /**
    *   @dev Calculate the amount of platform fee regarding the predefined platformFee.
    *   @param _price Price of the product to calculate the amount of platform fee.
    */    
    function calculatePlatformFee(
        uint256 _price
    ) public view returns (uint256) {
        return (_price).mul(platformFee).div(100000);
    }

    /**
    *   @dev Update the platform fee by only owner.
    *   @param _platformFee Platform fee to be updated.
    */    
    function updatePlatformFee(
        uint256 _platformFee
    ) external onlyOwner {
        require(_platformFee <=10000, "The platform fee can't be more than 10 percent.");
        platformFee = _platformFee;
    }
    
    /**
    *   @dev Helper function for calculating the balance of this smart contract
    *   Returns a value representing the balance of this smart contract (unit: 1 sun = 1e-6 TRX)
    */
    function getBalance() external view returns (uint256) {
        return payable(address(this)).balance;
    }
}