
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "ContractEmergencyStop",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "ContractResumed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "HospitalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "HospitalRatingSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "RatingSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "timestamp",
          "type": "uint64"
        }
      ],
      "name": "StatisticsUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        }
      ],
      "name": "createHospital",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        }
      ],
      "name": "deactivateHospital",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deployer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyStop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveHospitalIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllHospitalIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBatchStatistics",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "total",
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
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        }
      ],
      "name": "getHospital",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        }
      ],
      "name": "getHospitalStatistics",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "count",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumService",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumMedicine",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumDoctor",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumFacility",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumEnvironment",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumGuidance",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "sumTotal",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
      "inputs": [],
      "name": "getTotalRatingsCount",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        }
      ],
      "name": "hasUserRatedHospital",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "hospitals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
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
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        }
      ],
      "name": "reactivateHospital",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resumeContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "hospitalId",
          "type": "uint256"
        },
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
    },
    {
      "inputs": [],
      "name": "totalHospitals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

