pragma solidity ^0.5.0;

contract Marketplace {
     string public name;
     uint public productCount = 0;
     mapping(uint => Product) public products;

     struct Product {
         uint id;
         string name;
         uint price;
         address  payable owner;
         bool purchased;
     }

     event ProductCreated(
         uint id,
         string name,
         uint price,
         address  payable owner,
         bool purchased
     );

     event ProductPurchased(
         uint id,
         string name,
         uint price,
         address  payable owner,
         bool purchased
     );

     constructor () public {
         name = "Munapo Store";
     }

     function createProduct(string memory _name, uint _price) public {
         require(bytes(_name).length > 0, "A product must have a name");
         require(_price > 0, "Product must have a price");
         productCount ++;
         products[productCount] = Product(productCount, _name, _price, msg.sender, false);

         emit ProductCreated(productCount, _name, _price, msg.sender, false);
     }

     function purchaseProduct(uint _id) public payable {
         require(_id > 0 && _id <= productCount, "Invalid product id");

         Product memory _product = products[_id];
         require(!_product.purchased, "Product is off the market");
         require(msg.value >= _product.price, "Amount is below product price");

         address payable _seller = _product.owner;
         require(_seller != msg.sender, "You cannot buy your own product");

        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;

        address(_seller).transfer(msg.value);

         emit ProductPurchased(_id, _product.name, _product.price, _product.owner, _product.purchased);

     }

}