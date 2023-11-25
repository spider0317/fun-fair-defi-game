// test/stringSupport.js
const StringSupport = artifacts.require("./StringSupport.sol")
let stringSupportInstance

contract('StringSupport', function (accounts) {
    it("should be deployed", async function () {
        stringSupportInstance = await StringSupport.deployed()
        assert.isOk(stringSupportInstance, "instance should not be null")
        assert.equal(typeof stringSupportInstance, "object", "Instance should be an object")
    })

    it("should hash properly", async function () {
        let hash1 = await stringSupportInstance.saltedHash.call(123, "my salt 1")
        let hash2 = await stringSupportInstance.saltedHash.call(123, "my salt 2")
        let hash3 = await stringSupportInstance.saltedHash.call(234, "my salt 1")

        assert.isOk(hash1, "Hash should not be empty")
        assert.isOk(hash2, "Hash should not be empty")
        assert.isOk(hash3, "Hash should not be empty")

        assert.notEqual(hash1, hash2, "Different salt should produce different hashes")
        assert.notEqual(hash1, hash3, "Different numbers should produce different hashes")
        assert.notEqual(hash2, hash3, "Different numbers and salt should produce different hashes")
    })
})
