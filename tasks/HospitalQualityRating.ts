import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the HospitalQualityRating contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the HospitalQualityRating contract
 *
 *   npx hardhat --network localhost task:get-statistics
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the HospitalQualityRating contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the HospitalQualityRating contract
 *
 *   npx hardhat --network sepolia task:get-statistics
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the HospitalQualityRating address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const contract = await deployments.get("HospitalQualityRating");

  console.log("HospitalQualityRating address is " + contract.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:get-statistics
 *   - npx hardhat --network sepolia task:get-statistics
 */
task("task:get-statistics", "Calls the getStatistics() function of HospitalQualityRating Contract")
  .addOptionalParam("address", "Optionally specify the HospitalQualityRating contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("HospitalQualityRating");
    console.log(`HospitalQualityRating: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("HospitalQualityRating", contractDeployment.address);

    const encryptedTotalRatings = await contract.getTotalRatings();
    if (encryptedTotalRatings === ethers.ZeroHash) {
      console.log(`Total ratings: 0`);
      return;
    }

    const clearTotalRatings = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalRatings,
      contractDeployment.address,
      signers[0],
    );
    console.log(`Total ratings: ${clearTotalRatings}`);

    const encryptedSumService = await contract.getSumServiceQuality();
    if (encryptedSumService !== ethers.ZeroHash) {
      const clearSumService = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumService,
        contractDeployment.address,
        signers[0],
      );
      const avgService = clearTotalRatings > 0 ? Number(clearSumService) / Number(clearTotalRatings) : 0;
      console.log(`Service Quality - Sum: ${clearSumService}, Average: ${avgService.toFixed(2)}`);
    }

    const encryptedSumMedicine = await contract.getSumMedicineQuality();
    if (encryptedSumMedicine !== ethers.ZeroHash) {
      const clearSumMedicine = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumMedicine,
        contractDeployment.address,
        signers[0],
      );
      const avgMedicine = clearTotalRatings > 0 ? Number(clearSumMedicine) / Number(clearTotalRatings) : 0;
      console.log(`Medicine Quality - Sum: ${clearSumMedicine}, Average: ${avgMedicine.toFixed(2)}`);
    }

    const encryptedSumDoctor = await contract.getSumDoctorQuality();
    if (encryptedSumDoctor !== ethers.ZeroHash) {
      const clearSumDoctor = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumDoctor,
        contractDeployment.address,
        signers[0],
      );
      const avgDoctor = clearTotalRatings > 0 ? Number(clearSumDoctor) / Number(clearTotalRatings) : 0;
      console.log(`Doctor Quality - Sum: ${clearSumDoctor}, Average: ${avgDoctor.toFixed(2)}`);
    }

    const encryptedSumFacility = await contract.getSumFacilityQuality();
    if (encryptedSumFacility !== ethers.ZeroHash) {
      const clearSumFacility = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumFacility,
        contractDeployment.address,
        signers[0],
      );
      const avgFacility = clearTotalRatings > 0 ? Number(clearSumFacility) / Number(clearTotalRatings) : 0;
      console.log(`Facility Quality - Sum: ${clearSumFacility}, Average: ${avgFacility.toFixed(2)}`);
    }

    const encryptedSumEnvironment = await contract.getSumEnvironmentQuality();
    if (encryptedSumEnvironment !== ethers.ZeroHash) {
      const clearSumEnvironment = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumEnvironment,
        contractDeployment.address,
        signers[0],
      );
      const avgEnvironment = clearTotalRatings > 0 ? Number(clearSumEnvironment) / Number(clearTotalRatings) : 0;
      console.log(`Environment Quality - Sum: ${clearSumEnvironment}, Average: ${avgEnvironment.toFixed(2)}`);
    }

    const encryptedSumGuidance = await contract.getSumGuidanceQuality();
    if (encryptedSumGuidance !== ethers.ZeroHash) {
      const clearSumGuidance = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumGuidance,
        contractDeployment.address,
        signers[0],
      );
      const avgGuidance = clearTotalRatings > 0 ? Number(clearSumGuidance) / Number(clearTotalRatings) : 0;
      console.log(`Guidance Quality - Sum: ${clearSumGuidance}, Average: ${avgGuidance.toFixed(2)}`);
    }

    const encryptedSumTotal = await contract.getSumTotalScore();
    if (encryptedSumTotal !== ethers.ZeroHash) {
      const clearSumTotal = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSumTotal,
        contractDeployment.address,
        signers[0],
      );
      const avgTotal = clearTotalRatings > 0 ? Number(clearSumTotal) / Number(clearTotalRatings) : 0;
      console.log(`Total Score - Sum: ${clearSumTotal}, Average: ${avgTotal.toFixed(2)}`);
    }
  });

