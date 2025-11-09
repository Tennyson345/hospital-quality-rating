# Hospital Quality Rating System

A privacy-preserving hospital quality rating system built with FHEVM (Fully Homomorphic Encryption Virtual Machine) on Ethereum. This dApp allows users to submit encrypted ratings while maintaining complete privacy, with aggregated statistics that can be publicly decrypted.

## 🌐 Live Demo

**Vercel Deployment:** [https://hospital-quality-rating.vercel.app/](https://hospital-quality-rating.vercel.app/)

## 📹 Demo Video

Watch the demo video to see the system in action:

[![Demo Video](hospital-quality-rating.mp4)](hospital-quality-rating.mp4)

Direct link: [hospital-quality-rating.mp4](./hospital-quality-rating.mp4)

## 🏥 Features

- **Privacy-Preserving Ratings**: All ratings are encrypted using FHEVM before submission
- **Public Statistics**: Aggregated statistics are publicly decryptable by anyone
- **Medical-Themed UI**: Beautiful apple green themed interface designed for medical environments
- **Multi-Network Support**: Works on Hardhat local network and Sepolia testnet
- **One-Time Submission**: Each user can only submit one rating to prevent spam

## 📋 Rating Categories

Users can rate hospitals on 6 categories (0-10 scale):

- **Service Quality**: Overall service quality
- **Medicine Quality**: Quality of medicines provided
- **Medical Staff Quality**: Professional level of medical staff
- **Facility Quality**: Quality of medical facilities and equipment
- **Environment Quality**: Hospital cleanliness and environmental comfort
- **Guidance Clarity**: Clarity of hospital internal guidance

## 🔗 Contract Addresses

### Local Hardhat Network (Chain ID: 31337)
```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### Sepolia Testnet (Chain ID: 11155111)
```
0x1a9A554f59ab4031d6f66D5BE5dDcf3B9baD3b0B
```

## 🔐 Encryption & Decryption Logic

### Data Encryption (Frontend)

When a user submits ratings, the frontend encrypts each rating value using FHEVM:

```typescript
// Encrypt each rating value
const encryptedService = await fhevmInstance
  .createEncryptedInput(contractAddress, address)
  .add32(ratings.service)
  .encrypt();

// Submit encrypted values with proofs
const tx = await contract.submitRating(
  encryptedIdentity.handles[0],
  encryptedIdentity.inputProof,
  encryptedService.handles[0],
  encryptedService.inputProof,
  // ... other encrypted ratings
);
```

### On-Chain Aggregation (Smart Contract)

The smart contract receives encrypted values and performs homomorphic operations:

```solidity
// Convert external encrypted values to internal euint32
euint32 serviceRating = FHE.fromExternal(service, serviceProof);

// Aggregate statistics using homomorphic addition
totalRatings = FHE.add(totalRatings, FHE.asEuint32(1));
sumServiceQuality = FHE.add(sumServiceQuality, serviceRating);

// Make aggregated statistics publicly decryptable
FHE.makePubliclyDecryptable(totalRatings);
FHE.makePubliclyDecryptable(sumServiceQuality);
```

**Key Points:**
- Individual ratings remain encrypted and private
- Aggregation happens on encrypted data (homomorphic addition)
- Only aggregated sums are made publicly decryptable
- Individual user ratings cannot be decrypted by others

### Public Decryption (Frontend)

Aggregated statistics can be decrypted by anyone using `publicDecrypt`:

```typescript
// Get encrypted handles from contract
const encTotalRatings = await contract.getTotalRatings();
const encSumService = await contract.getSumServiceQuality();

// Decrypt using publicDecrypt (no signature needed)
const results = await fhevmInstance.publicDecrypt([
  encTotalRatings,
  encSumService,
  // ... other handles
]);

// Calculate averages after decryption
const total = Number(results[encTotalRatings]);
const avgService = total > 0 ? Number(results[encSumService]) / total : 0;
```

## 📄 Smart Contract

### Core Contract: `HospitalQualityRating.sol`

The contract implements the following key functions:

#### `submitRating()`
- Accepts encrypted ratings for 6 categories
- Validates that user hasn't already submitted
- Stores encrypted ratings per user
- Aggregates statistics using homomorphic addition
- Makes aggregated statistics publicly decryptable

#### `getStatistics()`
- Returns encrypted aggregated statistics
- Includes total count and sums for each category

#### `hasUserRated()`
- Checks if a specific user has already submitted a rating

### Contract Code Structure

```solidity
contract HospitalQualityRating is SepoliaConfig {
    struct Rating {
        euint32 serviceQuality;
        euint32 medicineQuality;
        euint32 doctorQuality;
        euint32 facilityQuality;
        euint32 environmentQuality;
        euint32 guidanceQuality;
    }

    mapping(address => Rating) private ratings;
    mapping(address => bool) private hasRated;
    
    // Aggregated statistics (publicly decryptable)
    euint32 private totalRatings;
    euint32 private sumServiceQuality;
    // ... other sums
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hardhat
- MetaMask or compatible Web3 wallet

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tennyson345/hospital-quality-rating.git
   cd hospital-quality-rating
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   ```

3. **Start Hardhat node**
   ```bash
   npx hardhat node --verbose
   ```

4. **Deploy contract to local network**
   ```bash
   npx hardhat deploy --network localhost
   ```

5. **Update ABI and addresses**
   ```bash
   cd frontend
   npm run genabi
   ```

6. **Start frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Connect MetaMask to local network**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Testing

Run the test suite:

```bash
npm test
```

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom medical theme
- **Web3**: Wagmi + RainbowKit for wallet connection
- **FHEVM**: Custom hooks for FHEVM integration
- **Encryption**: Client-side encryption using FHEVM SDK

### Smart Contract
- **Language**: Solidity 0.8.24
- **FHE Library**: FHEVM Solidity library
- **Network**: Sepolia testnet and Hardhat local

### Key Technologies
- **FHEVM**: Fully Homomorphic Encryption for blockchain
- **Ethers.js**: Ethereum library for interactions
- **Wagmi**: React Hooks for Ethereum
- **RainbowKit**: Wallet connection UI

## 🔒 Privacy & Security

- **Individual Privacy**: Each user's ratings are encrypted and stored separately
- **No Data Leakage**: Individual ratings cannot be decrypted by anyone except the contract
- **Public Aggregation**: Only aggregated statistics are publicly available
- **One-Time Submission**: Prevents spam and ensures data integrity

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## Recent Updates

### Version 1.0.0 (November 2025)
- ✅ Complete FHE-based hospital quality rating system implementation
- ✅ Enhanced security with reentrancy protection and access controls
- ✅ Improved UI/UX with batch operations and accessibility features
- ✅ Comprehensive test coverage and gas optimizations
- ✅ Full TypeScript support and modern Next.js architecture
- ✅ Privacy-preserving statistical computations with FHE

### Key Features Implemented
- **Hybrid Encryption**: AES-256 client-side + FHE key encryption
- **Selective Disclosure**: Granular control over rating visibility
- **Batch Operations**: Efficient bulk data retrieval
- **Cross-Platform**: Ethereum Sepolia deployment ready
- **Developer Friendly**: Complete tooling and documentation

Built with ❤️ using FHEVM and Next.js

