// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Hospital Quality Rating System
/// @notice A contract for collecting encrypted hospital quality ratings with privacy-preserving aggregation
contract HospitalQualityRating is SepoliaConfig {
    /// @dev Emergency stop flag
    bool private _emergencyStopped;

    /// @dev Constants for gas optimization
    uint256 private constant MAX_RATING_VALUE = 10;
    uint256 private constant RATING_CATEGORIES = 6;

    /// @dev Modifier to ensure the caller has a profile
    modifier onlyNewUser() {
        require(!hasRated[msg.sender], "User has already submitted a rating");
        _;
    }

    /// @dev Modifier to check if contract is not in emergency stop
    modifier whenNotEmergencyStopped() {
        require(!_emergencyStopped, "Contract is emergency stopped");
        _;
    }
    /// @dev Constants for gas optimization
    uint256 private constant MAX_RATING_VALUE = 10;
    uint256 private constant RATING_CATEGORIES = 6;

    /// @dev Modifier to ensure the caller has a profile
    modifier onlyNewUser() {
        require(!hasRated[msg.sender], "User has already submitted a rating");
        _;
    }

    // Rating categories: service, medicine, doctor, facility, environment, guidance
    struct Rating {
        euint32 serviceQuality;      // 0-10
        euint32 medicineQuality;     // 0-10
        euint32 doctorQuality;       // 0-10
        euint32 facilityQuality;      // 0-10
        euint32 environmentQuality;  // 0-10
        euint32 guidanceQuality;      // 0-10
    }

    // Encrypted user identity (address hash)
    mapping(address => bytes32) private userIdentities;

    // Store encrypted ratings per user
    mapping(address => Rating) private ratings;

    // Aggregated statistics (decryptable by anyone)
    // Initialize with zero values owned by contract deployer
    euint32 private totalRatings = FHE.asEuint32(0);           // Count of ratings
    euint32 private sumServiceQuality = FHE.asEuint32(0);      // Sum for average calculation
    euint32 private sumMedicineQuality = FHE.asEuint32(0);
    euint32 private sumDoctorQuality = FHE.asEuint32(0);
    euint32 private sumFacilityQuality = FHE.asEuint32(0);
    euint32 private sumEnvironmentQuality = FHE.asEuint32(0);
    euint32 private sumGuidanceQuality = FHE.asEuint32(0);
    euint32 private sumTotalScore = FHE.asEuint32(0);          // Sum of all scores (0-60 per rating)

    // Track if user has submitted a rating
    mapping(address => bool) private hasRated;

    // Events
    event RatingSubmitted(address indexed user, uint64 timestamp);
    event StatisticsUpdated(uint64 timestamp);

    // Events
    event RatingSubmitted(address indexed user, uint64 timestamp);
    event StatisticsUpdated(uint64 timestamp);

    constructor() {
        // Allow contract to operate on initial statistics values (owned by deployer)
        FHE.allow(totalRatings, address(this));
        FHE.allow(sumServiceQuality, address(this));
        FHE.allow(sumMedicineQuality, address(this));
        FHE.allow(sumDoctorQuality, address(this));
        FHE.allow(sumFacilityQuality, address(this));
        FHE.allow(sumEnvironmentQuality, address(this));
        FHE.allow(sumGuidanceQuality, address(this));
        FHE.allow(sumTotalScore, address(this));
    }

    /// @notice Submit a rating for hospital quality
    /// @param encryptedIdentity Encrypted user identity
    /// @param identityProof Proof for encrypted identity
    /// @param service Encrypted service quality rating (0-10)
    /// @param serviceProof Proof for service rating
    /// @param medicine Encrypted medicine quality rating (0-10)
    /// @param medicineProof Proof for medicine rating
    /// @param doctor Encrypted doctor quality rating (0-10)
    /// @param doctorProof Proof for doctor rating
    /// @param facility Encrypted facility quality rating (0-10)
    /// @param facilityProof Proof for facility rating
    /// @param environment Encrypted environment quality rating (0-10)
    /// @param environmentProof Proof for environment rating
    /// @param guidance Encrypted guidance quality rating (0-10)
    /// @param guidanceProof Proof for guidance rating
    function submitRating(
        externalEuint32 encryptedIdentity,
        bytes calldata identityProof,
        externalEuint32 service,
        bytes calldata serviceProof,
        externalEuint32 medicine,
        bytes calldata medicineProof,
        externalEuint32 doctor,
        bytes calldata doctorProof,
        externalEuint32 facility,
        bytes calldata facilityProof,
        externalEuint32 environment,
        bytes calldata environmentProof,
        externalEuint32 guidance,
        bytes calldata guidanceProof
    ) external onlyNewUser whenNotEmergencyStopped {

        // Convert external encrypted values to internal euint32
        // Verify identity proof (result not used, just verification)
        FHE.fromExternal(encryptedIdentity, identityProof);
        euint32 serviceRating = FHE.fromExternal(service, serviceProof);
        euint32 medicineRating = FHE.fromExternal(medicine, medicineProof);
        euint32 doctorRating = FHE.fromExternal(doctor, doctorProof);
        euint32 facilityRating = FHE.fromExternal(facility, facilityProof);
        euint32 environmentRating = FHE.fromExternal(environment, environmentProof);
        euint32 guidanceRating = FHE.fromExternal(guidance, guidanceProof);
        
        // Convert external encrypted values to internal euint32
        // Verify identity proof (result not used, just verification)
        FHE.fromExternal(encryptedIdentity, identityProof);
        euint32 serviceRating = FHE.fromExternal(service, serviceProof);
        euint32 medicineRating = FHE.fromExternal(medicine, medicineProof);
        euint32 doctorRating = FHE.fromExternal(doctor, doctorProof);
        euint32 facilityRating = FHE.fromExternal(facility, facilityProof);
        euint32 environmentRating = FHE.fromExternal(environment, environmentProof);
        euint32 guidanceRating = FHE.fromExternal(guidance, guidanceProof);

        // Store encrypted identity
        userIdentities[msg.sender] = bytes32(uint256(0)); // Placeholder, actual encryption handled off-chain
        
        // Store encrypted ratings
        ratings[msg.sender] = Rating({
            serviceQuality: serviceRating,
            medicineQuality: medicineRating,
            doctorQuality: doctorRating,
            facilityQuality: facilityRating,
            environmentQuality: environmentRating,
            guidanceQuality: guidanceRating
        });

        // Update aggregated statistics
        totalRatings = FHE.add(totalRatings, FHE.asEuint32(1));
        sumServiceQuality = FHE.add(sumServiceQuality, serviceRating);
        sumMedicineQuality = FHE.add(sumMedicineQuality, medicineRating);
        sumDoctorQuality = FHE.add(sumDoctorQuality, doctorRating);
        sumFacilityQuality = FHE.add(sumFacilityQuality, facilityRating);
        sumEnvironmentQuality = FHE.add(sumEnvironmentQuality, environmentRating);
        sumGuidanceQuality = FHE.add(sumGuidanceQuality, guidanceRating);

        // Calculate total score (sum of all categories)
        euint32 totalScore = FHE.add(
            FHE.add(
                FHE.add(serviceRating, medicineRating),
                FHE.add(doctorRating, facilityRating)
            ),
            FHE.add(environmentRating, guidanceRating)
        );
        sumTotalScore = FHE.add(sumTotalScore, totalScore);

        // Allow contract to access the newly created aggregated values
        // (Results of FHE operations are owned by the contract)
        FHE.allowThis(totalRatings);
        FHE.allowThis(sumServiceQuality);
        FHE.allowThis(sumMedicineQuality);
        FHE.allowThis(sumDoctorQuality);
        FHE.allowThis(sumFacilityQuality);
        FHE.allowThis(sumEnvironmentQuality);
        FHE.allowThis(sumGuidanceQuality);
        FHE.allowThis(sumTotalScore);

        // Make aggregated statistics publicly decryptable by all users
        // This allows anyone to decrypt and view the aggregated statistics
        FHE.makePubliclyDecryptable(totalRatings);
        FHE.makePubliclyDecryptable(sumServiceQuality);
        FHE.makePubliclyDecryptable(sumMedicineQuality);
        FHE.makePubliclyDecryptable(sumDoctorQuality);
        FHE.makePubliclyDecryptable(sumFacilityQuality);
        FHE.makePubliclyDecryptable(sumEnvironmentQuality);
        FHE.makePubliclyDecryptable(sumGuidanceQuality);
        FHE.makePubliclyDecryptable(sumTotalScore);

        hasRated[msg.sender] = true;

        emit RatingSubmitted(msg.sender, uint64(block.timestamp));
        emit StatisticsUpdated(uint64(block.timestamp));
    }

    /// @notice Get aggregated statistics (decryptable by anyone)
    /// @return count Total number of ratings
    /// @return avgService Average service quality
    /// @return avgMedicine Average medicine quality
    /// @return avgDoctor Average doctor quality
    /// @return avgFacility Average facility quality
    /// @return avgEnvironment Average environment quality
    /// @return avgGuidance Average guidance quality
    /// @return avgTotal Average total score
    function getStatistics() external view returns (
        euint32 count,
        euint32 avgService,
        euint32 avgMedicine,
        euint32 avgDoctor,
        euint32 avgFacility,
        euint32 avgEnvironment,
        euint32 avgGuidance,
        euint32 avgTotal
    ) {
        count = totalRatings;
        // Note: Division is not directly supported in FHE, averages need to be calculated off-chain
        // We return the sums and counts, and the frontend will calculate averages after decryption
        avgService = sumServiceQuality;
        avgMedicine = sumMedicineQuality;
        avgDoctor = sumDoctorQuality;
        avgFacility = sumFacilityQuality;
        avgEnvironment = sumEnvironmentQuality;
        avgGuidance = sumGuidanceQuality;
        avgTotal = sumTotalScore;
    }

    /// @notice Get total number of ratings
    function getTotalRatings() external view returns (euint32) {
        return totalRatings;
    }

    /// @notice Get sum of service quality ratings
    function getSumServiceQuality() external view returns (euint32) {
        return sumServiceQuality;
    }

    /// @notice Get sum of medicine quality ratings
    function getSumMedicineQuality() external view returns (euint32) {
        return sumMedicineQuality;
    }

    /// @notice Get sum of doctor quality ratings
    function getSumDoctorQuality() external view returns (euint32) {
        return sumDoctorQuality;
    }

    /// @notice Get sum of facility quality ratings
    function getSumFacilityQuality() external view returns (euint32) {
        return sumFacilityQuality;
    }

    /// @notice Get sum of environment quality ratings
    function getSumEnvironmentQuality() external view returns (euint32) {
        return sumEnvironmentQuality;
    }

    /// @notice Get sum of guidance quality ratings
    function getSumGuidanceQuality() external view returns (euint32) {
        return sumGuidanceQuality;
    }

    /// @notice Get sum of total scores
    function getSumTotalScore() external view returns (euint32) {
        return sumTotalScore;
    }

    /// @notice Check if a user has submitted a rating
    function hasUserRated(address user) external view returns (bool) {
        return hasRated[user];
    }

    /// @notice Get total number of ratings submitted
    /// @return count Total number of ratings
    function getTotalRatingsCount() external view returns (euint32) {
        return totalRatings;
    }

    /// @notice Get batch statistics for efficient frontend queries
    /// @return total Total number of ratings
    /// @return avgService Average service quality
    /// @return avgMedicine Average medicine quality
    /// @return avgDoctor Average doctor quality
    /// @return avgFacility Average facility quality
    /// @return avgEnvironment Average environment quality
    /// @return avgGuidance Average guidance quality
    function getBatchStatistics() external view returns (
        euint32 total,
        euint32 avgService,
        euint32 avgMedicine,
        euint32 avgDoctor,
        euint32 avgFacility,
        euint32 avgEnvironment,
        euint32 avgGuidance
    ) {
        // Return raw encrypted values for frontend decryption
        total = totalRatings;
        avgService = sumServiceQuality;
        avgMedicine = sumMedicineQuality;
        avgDoctor = sumDoctorQuality;
        avgFacility = sumFacilityQuality;
        avgEnvironment = sumEnvironmentQuality;
        avgGuidance = sumGuidanceQuality;
    }

    /// @notice Emergency stop the contract
    function emergencyStop() external {
        _emergencyStopped = true;
        emit ContractEmergencyStop(msg.sender, uint64(block.timestamp));
    }

    /// @notice Resume contract operations
    function resumeContract() external {
        _emergencyStopped = false;
        emit ContractResumed(msg.sender, uint64(block.timestamp));
    }
}

