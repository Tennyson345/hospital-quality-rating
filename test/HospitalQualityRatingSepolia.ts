import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { HospitalQualityRating } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("HospitalQualityRatingSepolia", function () {
  let signers: Signers;
  let contract: HospitalQualityRating;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const HospitalQualityRatingDeployment = await deployments.get("HospitalQualityRating");
      contractAddress = HospitalQualityRatingDeployment.address;
      contract = await ethers.getContractAt("HospitalQualityRating", HospitalQualityRatingDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("submit a rating and verify statistics", async function () {
    steps = 20;

    this.timeout(4 * 40000);

    progress("Checking if user has already rated...");
    const hasRated = await contract.hasUserRated(signers.alice.address);
    if (hasRated) {
      console.log("User has already submitted a rating, skipping test");
      this.skip();
    }

    progress("Encrypting identity...");
    const encryptedIdentity = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    progress("Encrypting service quality rating (8)...");
    const encryptedService = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(8)
      .encrypt();

    progress("Encrypting medicine quality rating (7)...");
    const encryptedMedicine = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(7)
      .encrypt();

    progress("Encrypting doctor quality rating (9)...");
    const encryptedDoctor = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(9)
      .encrypt();

    progress("Encrypting facility quality rating (6)...");
    const encryptedFacility = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(6)
      .encrypt();

    progress("Encrypting environment quality rating (8)...");
    const encryptedEnvironment = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(8)
      .encrypt();

    progress("Encrypting guidance quality rating (7)...");
    const encryptedGuidance = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(7)
      .encrypt();

    progress(`Submitting rating to contract ${contractAddress}...`);
    const tx = await contract
      .connect(signers.alice)
      .submitRating(
        encryptedIdentity.handles[0],
        encryptedIdentity.inputProof,
        encryptedService.handles[0],
        encryptedService.inputProof,
        encryptedMedicine.handles[0],
        encryptedMedicine.inputProof,
        encryptedDoctor.handles[0],
        encryptedDoctor.inputProof,
        encryptedFacility.handles[0],
        encryptedFacility.inputProof,
        encryptedEnvironment.handles[0],
        encryptedEnvironment.inputProof,
        encryptedGuidance.handles[0],
        encryptedGuidance.inputProof
      );
    await tx.wait();

    progress("Checking total ratings count...");
    const encryptedTotalRatings = await contract.getTotalRatings();
    expect(encryptedTotalRatings).to.not.eq(ethers.ZeroHash);

    progress("Decrypting total ratings count...");
    const clearTotalRatings = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalRatings,
      contractAddress,
      signers.alice,
    );
    progress(`Total ratings: ${clearTotalRatings}`);

    progress("Checking sum of service quality...");
    const encryptedSumService = await contract.getSumServiceQuality();
    expect(encryptedSumService).to.not.eq(ethers.ZeroHash);

    progress("Decrypting sum of service quality...");
    const clearSumService = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedSumService,
      contractAddress,
      signers.alice,
    );
    progress(`Sum of service quality: ${clearSumService}`);

    progress("Checking sum of total scores...");
    const encryptedSumTotal = await contract.getSumTotalScore();
    expect(encryptedSumTotal).to.not.eq(ethers.ZeroHash);

    progress("Decrypting sum of total scores...");
    const clearSumTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedSumTotal,
      contractAddress,
      signers.alice,
    );
    progress(`Sum of total scores: ${clearSumTotal}`);

    expect(clearTotalRatings).to.be.gte(1);
    expect(clearSumService).to.be.gte(8);
    expect(clearSumTotal).to.be.gte(45);
  });

  it("Should prevent duplicate ratings from same user", async function () {
    progress("Testing duplicate rating prevention");

    // First rating submission
    const encryptedIdentity = await fhevm.encrypt64(BigInt(ethers.encodeBytes32String("test-user")));
    const encryptedService = await fhevm.encrypt64(BigInt(5));
    const encryptedMedicine = await fhevm.encrypt64(BigInt(7));
    const encryptedDoctor = await fhevm.encrypt64(BigInt(6));
    const encryptedFacility = await fhevm.encrypt64(BigInt(8));
    const encryptedEnvironment = await fhevm.encrypt64(BigInt(7));
    const encryptedGuidance = await fhevm.encrypt64(BigInt(9));

    const tx1 = await contract.connect(signers.alice).submitRating(
      encryptedIdentity.handles[0],
      encryptedIdentity.inputProof,
      encryptedService.handles[0],
      encryptedService.inputProof,
      encryptedMedicine.handles[0],
      encryptedMedicine.inputProof,
      encryptedDoctor.handles[0],
      encryptedDoctor.inputProof,
      encryptedFacility.handles[0],
      encryptedFacility.inputProof,
      encryptedEnvironment.handles[0],
      encryptedEnvironment.inputProof,
      encryptedGuidance.handles[0],
      encryptedGuidance.inputProof
    );
    await tx1.wait();

    // Attempt second rating from same user (should fail)
    try {
      const tx2 = await contract.connect(signers.alice).submitRating(
        encryptedIdentity.handles[0],
        encryptedIdentity.inputProof,
        encryptedService.handles[0],
        encryptedService.inputProof,
        encryptedMedicine.handles[0],
        encryptedMedicine.inputProof,
        encryptedDoctor.handles[0],
        encryptedDoctor.inputProof,
        encryptedFacility.handles[0],
        encryptedFacility.inputProof,
        encryptedEnvironment.handles[0],
        encryptedEnvironment.inputProof,
        encryptedGuidance.handles[0],
        encryptedGuidance.inputProof
      );
      await tx2.wait();
      expect.fail("Should not allow duplicate ratings");
    } catch (error: any) {
      expect(error.message).to.include("User has already submitted a rating");
    }

    progress("Successfully prevented duplicate rating submission");
  });
});

