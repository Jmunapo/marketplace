const Marketplace = artifacts.require("./Marketplace.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Marketplace", ([deployer, seller, buyer]) => {
  let mk;

  before(async () => {
    mk = await Marketplace.deployed();
  });

  describe("deployment", async () => {
    it("deployed successfully", async () => {
      const address = await mk.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await mk.name();
      assert.equal(name, "Munapo Store");
    });
  });

  describe("products", async () => {
    let res, productCount;

    before(async () => {
      res = await mk.createProduct("mouse", web3.utils.toWei("1", "ether"), {
        from: seller
      });
      productCount = await mk.productCount();
    });

    it("creates products", async () => {
      assert.equal(productCount, 1);
      const ev = res.logs[0].args;

      assert.equal(ev.id.toNumber(), productCount.toNumber(), "id is correct");
      assert.equal(ev.name, "mouse", "name is correct");
      assert.equal(ev.owner, seller, "owner is correct");

      await mk.createProduct("", web3.utils.toWei("1", "ether"), {
        from: seller
      }).should.be.rejected;

      await mk.createProduct("DVD", 0, {
        from: seller
      }).should.be.rejected;
    });

    it("lists products", async () => {
      const product = await mk.products(productCount);
      assert.equal(
        product.id.toNumber(),
        productCount.toNumber(),
        "id is correct"
      );
      assert.equal(product.name, "mouse", "name is correct");
      assert.equal(product.owner, seller, "owner is correct");
    });

    it("sells product", async () => {
      let oldSellerBalance;
      oldSellerBalance = await web3.eth.getBalance(seller);
      oldSellerBalance = new web3.utils.BN(oldSellerBalance);

      res = await mk.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("1", "ether")
      });

      const ev = res.logs[0].args;

      assert.equal(ev.id.toNumber(), productCount.toNumber(), "id is correct");
      assert.equal(ev.name, "mouse", "name is correct");
      assert.equal(ev.owner, buyer, "owner is correct");

      let newSellerBalance;
      newSellerBalance = await web3.eth.getBalance(seller);
      newSellerBalance = new web3.utils.BN(newSellerBalance);

      let price;
      price = web3.utils.toWei("1", "ether");
      price = new web3.utils.BN(price);

      const expectedBal = oldSellerBalance.add(price);

      assert.equal(newSellerBalance.toString(), expectedBal.toString());

      await mk.purchaseProduct(99, {
        from: buyer,
        value: web3.utils.toWei("1", "ether")
      }).should.be.rejected;

      await mk.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("0.5", "ether")
      }).should.be.rejected;

      await mk.purchaseProduct(productCount, {
        from: deployer,
        value: web3.utils.toWei("1", "ether")
      }).should.be.rejected;

      await mk.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("1", "ether")
      }).should.be.rejected;
    });
  });
});
