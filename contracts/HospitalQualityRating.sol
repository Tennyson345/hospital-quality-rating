// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Hospital Quality Rating System
/// @notice A contract for collecting encrypted hospital quality ratings with privacy-preserving aggregation
contract HospitalQualityRating is SepoliaConfig {
    /// @dev Deployer address (only deployer can create hospitals)
    address public immutable deployer;
    
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
    
    /// @dev Modifier to ensure only deployer can call
    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can perform this action");
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

    /// @dev Hospital information structure
    struct Hospital {
        uint256 hospitalId;           // Hospital ID (starts from 1)
        string name;                  // Hospital name (public)
        string location;              // Hospital location (public)
        uint256 createdAt;            // Creation timestamp
        bool isActive;                // Whether the hospital is active
    }

    /// @dev Statistics for each hospital
    struct HospitalStatistics {
        euint32 totalRatings;         // Total number of ratings
        euint32 sumServiceQuality;
        euint32 sumMedicineQuality;
        euint32 sumDoctorQuality;
        euint32 sumFacilityQuality;
        euint32 sumEnvironmentQuality;
        euint32 sumGuidanceQuality;
        euint32 sumTotalScore;
    }

    // Encrypted user identity (address hash)
    mapping(address => bytes32) private userIdentities;

    // Store encrypted ratings per user (kept for backward compatibility)
    mapping(address => Rating) private ratings;
    
    // Hospital management
    mapping(uint256 => Hospital) public hospitals;                    // hospitalId => Hospital info
    mapping(uint256 => HospitalStatistics) private hospitalStats;   // hospitalId => Statistics
    mapping(address => mapping(uint256 => bool)) private hasRatedHospital; // user => hospitalId => has rated
    uint256 public totalHospitals;                                    // Total number of hospitals

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
    event ContractEmergencyStop(address indexed caller, uint64 timestamp);
    event ContractResumed(address indexed caller, uint64 timestamp);
    event HospitalCreated(uint256 indexed hospitalId, string name, string location, address indexed creator, uint64 timestamp);
    event HospitalRatingSubmitted(address indexed user, uint256 indexed hospitalId, uint64 timestamp);

    constructor() {
        deployer = msg.sender;  // Save deployer address
        
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

    /// @notice Create a new hospital (only deployer can call)
    /// @param name Hospital name
    /// @param location Hospital location
    function createHospital(
        string memory name,
        string memory location
    ) external onlyDeployer whenNotEmergencyStopped {
        require(bytes(name).length > 0, "Hospital name cannot be empty");
        require(bytes(location).length > 0, "Hospital location cannot be empty");
        
        totalHospitals++;
        uint256 hospitalId = totalHospitals;
        
        hospitals[hospitalId] = Hospital({
            hospitalId: hospitalId,
            name: name,
            location: location,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Initialize hospital statistics with zero values
        HospitalStatistics storage stats = hospitalStats[hospitalId];
        stats.totalRatings = FHE.asEuint32(0);
        stats.sumServiceQuality = FHE.asEuint32(0);
        stats.sumMedicineQuality = FHE.asEuint32(0);
        stats.sumDoctorQuality = FHE.asEuint32(0);
        stats.sumFacilityQuality = FHE.asEuint32(0);
        stats.sumEnvironmentQuality = FHE.asEuint32(0);
        stats.sumGuidanceQuality = FHE.asEuint32(0);
        stats.sumTotalScore = FHE.asEuint32(0);
        
        // Allow contract to operate on initial statistics values
        FHE.allow(stats.totalRatings, address(this));
        FHE.allow(stats.sumServiceQuality, address(this));
        FHE.allow(stats.sumMedicineQuality, address(this));
        FHE.allow(stats.sumDoctorQuality, address(this));
        FHE.allow(stats.sumFacilityQuality, address(this));
        FHE.allow(stats.sumEnvironmentQuality, address(this));
        FHE.allow(stats.sumGuidanceQuality, address(this));
        FHE.allow(stats.sumTotalScore, address(this));
        
        emit HospitalCreated(hospitalId, name, location, msg.sender, uint64(block.timestamp));
    }

    /// @notice Submit a rating for a specific hospital
    /// @param hospitalId The ID of the hospital being rated (public, for storage and verification)
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
        uint256 hospitalId,
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
    ) external whenNotEmergencyStopped {
        // Validate hospital exists and is active
        require(hospitalId > 0 && hospitalId <= totalHospitals, "Invalid hospital ID");
        require(hospitals[hospitalId].isActive, "Hospital does not exist or is inactive");
        require(!hasRatedHospital[msg.sender][hospitalId], "User has already rated this hospital");

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
        
        // Store encrypted ratings (for backward compatibility)
        ratings[msg.sender] = Rating({
            serviceQuality: serviceRating,
            medicineQuality: medicineRating,
            doctorQuality: doctorRating,
            facilityQuality: facilityRating,
            environmentQuality: environmentRating,
            guidanceQuality: guidanceRating
        });

        // Update global aggregated statistics (for backward compatibility)
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

        // Update hospital-specific statistics
        HospitalStatistics storage hospitalStatsData = hospitalStats[hospitalId];
        hospitalStatsData.totalRatings = FHE.add(hospitalStatsData.totalRatings, FHE.asEuint32(1));
        hospitalStatsData.sumServiceQuality = FHE.add(hospitalStatsData.sumServiceQuality, serviceRating);
        hospitalStatsData.sumMedicineQuality = FHE.add(hospitalStatsData.sumMedicineQuality, medicineRating);
        hospitalStatsData.sumDoctorQuality = FHE.add(hospitalStatsData.sumDoctorQuality, doctorRating);
        hospitalStatsData.sumFacilityQuality = FHE.add(hospitalStatsData.sumFacilityQuality, facilityRating);
        hospitalStatsData.sumEnvironmentQuality = FHE.add(hospitalStatsData.sumEnvironmentQuality, environmentRating);
        hospitalStatsData.sumGuidanceQuality = FHE.add(hospitalStatsData.sumGuidanceQuality, guidanceRating);
        hospitalStatsData.sumTotalScore = FHE.add(hospitalStatsData.sumTotalScore, totalScore);

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
        
        // Allow contract to access hospital-specific aggregated values
        FHE.allowThis(hospitalStatsData.totalRatings);
        FHE.allowThis(hospitalStatsData.sumServiceQuality);
        FHE.allowThis(hospitalStatsData.sumMedicineQuality);
        FHE.allowThis(hospitalStatsData.sumDoctorQuality);
        FHE.allowThis(hospitalStatsData.sumFacilityQuality);
        FHE.allowThis(hospitalStatsData.sumEnvironmentQuality);
        FHE.allowThis(hospitalStatsData.sumGuidanceQuality);
        FHE.allowThis(hospitalStatsData.sumTotalScore);

        // Make aggregated statistics publicly decryptable by all users
        // Global statistics
        FHE.makePubliclyDecryptable(totalRatings);
        FHE.makePubliclyDecryptable(sumServiceQuality);
        FHE.makePubliclyDecryptable(sumMedicineQuality);
        FHE.makePubliclyDecryptable(sumDoctorQuality);
        FHE.makePubliclyDecryptable(sumFacilityQuality);
        FHE.makePubliclyDecryptable(sumEnvironmentQuality);
        FHE.makePubliclyDecryptable(sumGuidanceQuality);
        FHE.makePubliclyDecryptable(sumTotalScore);
        
        // Hospital-specific statistics
        FHE.makePubliclyDecryptable(hospitalStatsData.totalRatings);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumServiceQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumMedicineQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumDoctorQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumFacilityQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumEnvironmentQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumGuidanceQuality);
        FHE.makePubliclyDecryptable(hospitalStatsData.sumTotalScore);

        // Mark user as having rated this hospital
        hasRatedHospital[msg.sender][hospitalId] = true;
        hasRated[msg.sender] = true;  // For backward compatibility

        emit RatingSubmitted(msg.sender, uint64(block.timestamp));
        emit HospitalRatingSubmitted(msg.sender, hospitalId, uint64(block.timestamp));
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

    /// @notice Check if a user has submitted a rating (backward compatibility)
    function hasUserRated(address user) external view returns (bool) {
        return hasRated[user];
    }
    
    /// @notice Check if a user has rated a specific hospital
    /// @param user User address
    /// @param hospitalId Hospital ID
    /// @return True if user has rated this hospital
    function hasUserRatedHospital(address user, uint256 hospitalId) external view returns (bool) {
        return hasRatedHospital[user][hospitalId];
    }
    
    /// @notice Get hospital information
    /// @param hospitalId Hospital ID
    /// @return name Hospital name
    /// @return location Hospital location
    /// @return createdAt Creation timestamp
    /// @return isActive Whether the hospital is active
    function getHospital(uint256 hospitalId) external view returns (
        string memory name,
        string memory location,
        uint256 createdAt,
        bool isActive
    ) {
        require(hospitalId > 0 && hospitalId <= totalHospitals, "Invalid hospital ID");
        Hospital memory hospital = hospitals[hospitalId];
        return (hospital.name, hospital.location, hospital.createdAt, hospital.isActive);
    }
    
    /// @notice Get statistics for a specific hospital
    /// @param hospitalId Hospital ID
    /// @return count Total number of ratings for this hospital
    /// @return sumService Sum of service quality ratings
    /// @return sumMedicine Sum of medicine quality ratings
    /// @return sumDoctor Sum of doctor quality ratings
    /// @return sumFacility Sum of facility quality ratings
    /// @return sumEnvironment Sum of environment quality ratings
    /// @return sumGuidance Sum of guidance quality ratings
    /// @return sumTotal Sum of total scores
    function getHospitalStatistics(uint256 hospitalId) external view returns (
        euint32 count,
        euint32 sumService,
        euint32 sumMedicine,
        euint32 sumDoctor,
        euint32 sumFacility,
        euint32 sumEnvironment,
        euint32 sumGuidance,
        euint32 sumTotal
    ) {
        require(hospitalId > 0 && hospitalId <= totalHospitals, "Invalid hospital ID");
        HospitalStatistics memory stats = hospitalStats[hospitalId];
        return (
            stats.totalRatings,
            stats.sumServiceQuality,
            stats.sumMedicineQuality,
            stats.sumDoctorQuality,
            stats.sumFacilityQuality,
            stats.sumEnvironmentQuality,
            stats.sumGuidanceQuality,
            stats.sumTotalScore
        );
    }
    
    /// @notice Get all hospital IDs
    /// @return Array of all hospital IDs
    function getAllHospitalIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](totalHospitals);
        for (uint256 i = 1; i <= totalHospitals; i++) {
            ids[i - 1] = i;
        }
        return ids;
    }
    
    /// @notice Get active hospital IDs only
    /// @return Array of active hospital IDs
    function getActiveHospitalIds() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        // First pass: count active hospitals
        for (uint256 i = 1; i <= totalHospitals; i++) {
            if (hospitals[i].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: collect active hospital IDs
        uint256[] memory ids = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalHospitals; i++) {
            if (hospitals[i].isActive) {
                ids[index] = i;
                index++;
            }
        }
        return ids;
    }
    
    /// @notice Deactivate a hospital (only deployer)
    /// @param hospitalId Hospital ID to deactivate
    function deactivateHospital(uint256 hospitalId) external onlyDeployer {
        require(hospitalId > 0 && hospitalId <= totalHospitals, "Invalid hospital ID");
        hospitals[hospitalId].isActive = false;
    }
    
    /// @notice Reactivate a hospital (only deployer)
    /// @param hospitalId Hospital ID to reactivate
    function reactivateHospital(uint256 hospitalId) external onlyDeployer {
        require(hospitalId > 0 && hospitalId <= totalHospitals, "Invalid hospital ID");
        hospitals[hospitalId].isActive = true;
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

