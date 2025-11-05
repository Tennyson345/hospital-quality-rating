
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const HospitalQualityRatingABI = {
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "getStatistics",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "count",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgService",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgMedicine",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgDoctor",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgFacility",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgEnvironment",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgGuidance",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "avgTotal",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumDoctorQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumEnvironmentQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumFacilityQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumGuidanceQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumMedicineQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumServiceQuality",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSumTotalScore",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalRatings",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "hasUserRated",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "encryptedIdentity",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "identityProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "service",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "serviceProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "medicine",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "medicineProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "doctor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "doctorProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "facility",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "facilityProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "environment",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "environmentProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint32",
          "name": "guidance",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "guidanceProof",
          "type": "bytes"
        }
      ],
      "name": "submitRating",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

