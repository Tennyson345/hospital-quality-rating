import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedHospitalQualityRating = await deploy("HospitalQualityRating", {
    from: deployer,
    log: true,
  });

  console.log(`HospitalQualityRating contract: `, deployedHospitalQualityRating.address);
};
export default func;
func.id = "deploy_hospitalQualityRating"; // id required to prevent reexecution
func.tags = ["HospitalQualityRating"];
