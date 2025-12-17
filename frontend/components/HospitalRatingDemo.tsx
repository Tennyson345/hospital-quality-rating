"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFhevm } from "@/fhevm/useFhevm";
import { HospitalQualityRatingABI } from "@/abi/HospitalQualityRatingABI";
import { HospitalQualityRatingAddresses } from "@/abi/HospitalQualityRatingAddresses";
import { ethers } from "ethers";

const RATING_CATEGORIES = [
  {
    key: "service",
    label: "Service Quality",
    description: "Overall service quality (0-10)",
    icon: "🏥"
  },
  {
    key: "medicine",
    label: "Medicine Quality",
    description: "Quality of medicines provided (0-10)",
    icon: "💊"
  },
  {
    key: "doctor",
    label: "Medical Staff Quality",
    description: "Professional level of medical staff (0-10)",
    icon: "👨‍⚕️"
  },
  {
    key: "facility",
    label: "Facility Quality",
    description: "Quality of medical facilities and equipment (0-10)",
    icon: "🛠️"
  },
  {
    key: "environment",
    label: "Environment Quality",
    description: "Hospital cleanliness and environmental comfort (0-10)",
    icon: "🏥"
  },
  {
    key: "guidance",
    label: "Guidance Clarity",
    description: "Clarity of hospital internal guidance (0-10)",
    icon: "📋"
  },
];

const HospitalRatingDemoComponent = () => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  const [ratings, setRatings] = useState<Record<string, number>>({
    service: 0,
    medicine: 0,
    doctor: 0,
    facility: 0,
    environment: 0,
    guidance: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [statistics, setStatistics] = useState<{
    totalRatings: number;
    averages: {
      service: number;
      medicine: number;
      doctor: number;
      facility: number;
      environment: number;
      guidance: number;
    };
    totalScore: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'rate' | 'stats'>('rate');

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get contract address
  const contractAddress = chainId 
    ? HospitalQualityRatingAddresses[chainId.toString() as keyof typeof HospitalQualityRatingAddresses]?.address
    : undefined;

  const isDeployed = Boolean(contractAddress && contractAddress !== ethers.ZeroAddress);

  // Convert walletClient to Eip1193Provider for FHEVM
  // FHEVM needs an Eip1193Provider, which walletClient.transport provides
  const eip1193Provider = walletClient?.transport as ethers.Eip1193Provider | undefined;

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider,
    chainId: chainId || 31337,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && isDeployed,
  });

  // Check if user has already rated
  useEffect(() => {
    if (!isConnected || !isDeployed || !address || !publicClient) return;

    const checkHasRated = async () => {
      try {
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HospitalQualityRatingABI.abi,
          functionName: "hasUserRated",
          args: [address as `0x${string}`],
        });
        setHasRated(result as boolean);
      } catch (error) {
        console.error("Error checking if user has rated:", error);
      }
    };

    checkHasRated();
  }, [isConnected, isDeployed, address, publicClient, contractAddress]);

  // Load statistics
  const loadStatistics = async () => {
    if (!isConnected || !isDeployed || !fhevmInstance || !contractAddress) {
      setMessage("Please connect your wallet and ensure contract is deployed");
      return;
    }

    setIsLoadingStats(true);
    setMessage("Loading statistics...");

    try {
      // Use publicClient for read-only operations (no wallet needed for public decryption)
      // Convert publicClient to ethers provider
      let contractProvider: ethers.Provider;
      if (chainId === 31337) {
        // Local Hardhat network
        contractProvider = new ethers.JsonRpcProvider("http://localhost:8545");
      } else if (publicClient) {
        // Use publicClient.transport to create BrowserProvider for other networks (Sepolia, etc.)
        const network = {
          chainId: publicClient.chain.id,
          name: publicClient.chain.name,
          ensAddress: publicClient.chain.contracts?.ensRegistry?.address,
        };
        contractProvider = new ethers.BrowserProvider(publicClient.transport, network);
      } else {
        throw new Error("No provider available");
      }
      
      const contract = new ethers.Contract(
        contractAddress,
        HospitalQualityRatingABI.abi,
        contractProvider
      );

      // Get encrypted values from contract
      const [encTotalRatings, encSumService, encSumMedicine, encSumDoctor, encSumFacility, encSumEnvironment, encSumGuidance, encSumTotal] = await Promise.all([
        contract.getTotalRatings(),
        contract.getSumServiceQuality(),
        contract.getSumMedicineQuality(),
        contract.getSumDoctorQuality(),
        contract.getSumFacilityQuality(),
        contract.getSumEnvironmentQuality(),
        contract.getSumGuidanceQuality(),
        contract.getSumTotalScore(),
      ]);

      // Collect all handles (filter out zero handles)
      const handles = [
        encTotalRatings,
        encSumService,
        encSumMedicine,
        encSumDoctor,
        encSumFacility,
        encSumEnvironment,
        encSumGuidance,
        encSumTotal,
      ].filter(h => h && h !== "0x0000000000000000000000000000000000000000000000000000000000000000");

      if (handles.length === 0) {
        setStatistics({
          totalRatings: 0,
          averages: {
            service: 0,
            medicine: 0,
            doctor: 0,
            facility: 0,
            environment: 0,
            guidance: 0,
          },
          totalScore: 0,
        });
        setMessage("No statistics available yet");
        setIsLoadingStats(false);
        return;
      }

      // Use publicDecrypt for publicly decryptable values (no signature needed)
      // This allows anyone to decrypt the aggregated statistics
      const results = await fhevmInstance.publicDecrypt(handles);

      const decryptedTotal = results[encTotalRatings] || "0";
      const decryptedService = results[encSumService] || "0";
      const decryptedMedicine = results[encSumMedicine] || "0";
      const decryptedDoctor = results[encSumDoctor] || "0";
      const decryptedFacility = results[encSumFacility] || "0";
      const decryptedEnvironment = results[encSumEnvironment] || "0";
      const decryptedGuidance = results[encSumGuidance] || "0";
      const decryptedTotalScore = results[encSumTotal] || "0";

      const total = Number(decryptedTotal);
      const stats = {
        totalRatings: total,
        averages: {
          service: total > 0 ? Number(decryptedService) / total : 0,
          medicine: total > 0 ? Number(decryptedMedicine) / total : 0,
          doctor: total > 0 ? Number(decryptedDoctor) / total : 0,
          facility: total > 0 ? Number(decryptedFacility) / total : 0,
          environment: total > 0 ? Number(decryptedEnvironment) / total : 0,
          guidance: total > 0 ? Number(decryptedGuidance) / total : 0,
        },
        totalScore: total > 0 ? Number(decryptedTotalScore) / total : 0,
      };

      setStatistics(stats);
      setMessage("Statistics loaded successfully");
    } catch (error: unknown) {
      console.error("Error loading statistics:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Submit rating
  const handleSubmit = async () => {
    if (!isConnected || !isDeployed || !fhevmInstance || !address || !contractAddress || !walletClient) {
      setMessage("Please connect your wallet");
      return;
    }

    // Check if user has already submitted
    if (hasRated) {
      setMessage("You have already submitted a rating. Each user can only submit once.");
      return;
    }

    // Validate ratings
    const values = Object.values(ratings);
    if (values.some(v => v < 0 || v > 10)) {
      setMessage("All ratings must be between 0 and 10");
      return;
    }

    setIsSubmitting(true);
    setMessage("Encrypting and submitting rating...");

    try {
      // Double-check hasRated status before submitting (in case it changed)
      if (publicClient && contractAddress && address) {
        const hasRatedCheck = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HospitalQualityRatingABI.abi,
          functionName: "hasUserRated",
          args: [address as `0x${string}`],
        });
        if (hasRatedCheck) {
          setMessage("You have already submitted a rating. Each user can only submit once.");
          setHasRated(true);
          return;
        }
      }

      // Convert walletClient to ethers provider
      const { account, chain, transport } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      const submitProvider = new ethers.BrowserProvider(transport, network);
      const submitSigner = await submitProvider.getSigner(account.address);
      const contract = new ethers.Contract(
        contractAddress,
        HospitalQualityRatingABI.abi,
        submitSigner
      );

      // Encrypt all values using FHEVM API
      const encryptedIdentity = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(1)
        .encrypt();
      
      const encryptedService = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.service)
        .encrypt();
      
      const encryptedMedicine = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.medicine)
        .encrypt();
      
      const encryptedDoctor = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.doctor)
        .encrypt();
      
      const encryptedFacility = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.facility)
        .encrypt();
      
      const encryptedEnvironment = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.environment)
        .encrypt();
      
      const encryptedGuidance = await fhevmInstance
        .createEncryptedInput(contractAddress, address)
        .add32(ratings.guidance)
        .encrypt();

      // Submit transaction
      const tx = await contract.submitRating(
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

      setMessage(`Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
      await tx.wait();
      setMessage("Rating submitted successfully!");
      setHasRated(true);
      await loadStatistics();
    } catch (error: unknown) {
      console.error("Error submitting rating:", error);

      // Try to decode the error message
      const errorObj = error instanceof Error ? error : { message: "Unknown error" };
      let errorMessage = errorObj.message || "Unknown error";

      // Enhanced error handling with specific messages
      
      // Check for common error patterns
      if (errorMessage.includes("already submitted") || errorMessage.includes("hasRated")) {
        errorMessage = "You have already submitted a rating. Each user can only submit once.";
        setHasRated(true);
      } else if (errorMessage.includes("execution reverted")) {
        // Try to decode custom error - check if user has already rated
        // The error data might contain information about the revert reason
        try {
          // Re-check hasRated status from contract
          if (publicClient && contractAddress && address) {
            const hasRatedCheck = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: HospitalQualityRatingABI.abi,
              functionName: "hasUserRated",
              args: [address as `0x${string}`],
            });
            if (hasRatedCheck) {
              errorMessage = "You have already submitted a rating. Each user can only submit once.";
              setHasRated(true);
            } else {
              errorMessage = `Transaction failed: ${errorMessage}. This might be due to an issue with the encrypted data validation. Please try again.`;
            }
          } else {
            errorMessage = `Transaction failed: ${errorMessage}. This might be because you have already submitted a rating, or there was an issue with the encrypted data.`;
          }
        } catch (checkError) {
          console.error("Error checking hasRated status:", checkError);
          errorMessage = `Transaction failed: ${errorMessage}. This might be because you have already submitted a rating, or there was an issue with the encrypted data.`;
        }
      } else if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
        errorMessage = "Transaction was cancelled by user.";
      }
      
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen medical-bg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 bg-medical-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏥</span>
              </div>
              <h1 className="text-2xl font-bold text-medical-green-900 mb-2">
                Hospital Quality Rating System
              </h1>
              <p className="text-medical-green-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen medical-bg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-medical-green-400 to-medical-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <div className="relative">
              <div className="w-8 h-1 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-1 h-8 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-medical-green-800 mb-4">
            Hospital Quality Rating System
          </h1>
          <p className="text-xl text-medical-green-600 mb-4 max-w-2xl mx-auto">
            Protecting your medical rating privacy with fully homomorphic encryption technology
          </p>
          <div className="mb-6 p-4 bg-medical-green-50 rounded-lg border border-medical-green-200 max-w-xl mx-auto">
            <p className="text-medical-green-700 text-sm">
              🔐 <strong>Wallet Connection Required</strong>: To perform encryption and decryption operations, please connect your Web3 wallet (e.g., MetaMask) first
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <div className="medical-card p-6 text-center">
            <div className="w-12 h-12 bg-medical-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-medical-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-medical-green-800 mb-2">Privacy First</h3>
            <p className="text-medical-green-600 text-sm">Your ratings are encrypted and cannot be linked to your identity</p>
          </div>

          <div className="medical-card p-6 text-center">
            <div className="w-12 h-12 bg-medical-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-medical-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-medical-green-800 mb-2">Data Insights</h3>
            <p className="text-medical-green-600 text-sm">Help improve healthcare quality with aggregated, anonymous statistics</p>
          </div>

          <div className="medical-card p-6 text-center">
            <div className="w-12 h-12 bg-medical-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-medical-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-medical-green-800 mb-2">Fast & Secure</h3>
            <p className="text-medical-green-600 text-sm">Submit ratings instantly with blockchain-level security</p>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="min-h-screen medical-bg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="medical-card p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contract Not Deployed</h2>
          <p className="text-medical-green-600 mb-6">
            The MediRate contract is not deployed on this network. Please deploy the contract first.
          </p>
          <div className="text-sm text-gray-500">
            <p>Current Network: {chainId}</p>
            <p>Expected Contract: HospitalQualityRating</p>
          </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen medical-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Wallet Connection */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-medical-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-medical-green-900">
                  Hospital Quality Rating System
                </h1>
                <p className="text-sm text-medical-green-600">
                  Privacy-protected medical quality rating platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isConnected && address && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-medical-green-50 rounded-lg border border-medical-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-medical-green-700">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-medical-green-200">
          <button
            onClick={() => setActiveTab('rate')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'rate'
                ? 'bg-medical-green-500 text-white shadow-md'
                : 'text-medical-green-600 hover:bg-medical-green-50'
            }`}
          >
            📝 Rate Hospital
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-medical-green-500 text-white shadow-md'
                : 'text-medical-green-600 hover:bg-medical-green-50'
            }`}
          >
            📊 View Statistics
          </button>
        </div>
      </div>

      {/* Rating Tab */}
      {activeTab === 'rate' && (
        <div className="max-w-2xl mx-auto">
          {!hasRated ? (
            <div className="medical-card p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-medical-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-medical-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-medical-green-800 mb-2">Share Your Experience</h2>
                <p className="text-medical-green-600">
                  Rate your hospital experience across 6 key categories. All data is encrypted and anonymous.
                </p>
              </div>

              <div className="space-y-6">
                {RATING_CATEGORIES.map((category) => (
                  <div key={category.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-semibold text-medical-green-800 text-lg">
                          {category.label}
                        </label>
                        <p className="text-sm text-medical-green-600">{category.description}</p>
                      </div>
                      <div className="text-2xl font-bold text-medical-green-700 bg-medical-green-50 px-3 py-1 rounded-lg">
                        {ratings[category.key]}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={ratings[category.key]}
                      onChange={(e) =>
                        setRatings({ ...ratings, [category.key]: parseInt(e.target.value) })
                      }
                      className="rating-slider w-full"
                    />
                    <div className="flex justify-between text-sm text-medical-green-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || fhevmStatus !== "ready"}
                className="medical-btn w-full mt-8 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Encrypting & Submitting...
                  </span>
                ) : (
                  "Submit Secure Rating"
                )}
              </button>
            </div>
          ) : (
            <div className="medical-card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-medical-green-800 mb-4">Thank You!</h2>
              <p className="text-medical-green-600 mb-6">
                Your rating has been securely submitted and encrypted. Thank you for helping improve healthcare quality.
              </p>
              <div className="medical-badge inline-block">
                ✓ Rating Submitted Successfully
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="max-w-4xl mx-auto">
          <div className="medical-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-medical-green-800 mb-2">Hospital Quality Insights</h2>
                <p className="text-medical-green-600">Aggregated anonymous ratings from the community</p>
              </div>
              <button
                onClick={loadStatistics}
                disabled={isLoadingStats || fhevmStatus !== "ready"}
                className="medical-btn px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingStats ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  "🔄 Refresh Data"
                )}
              </button>
            </div>

            {statistics ? (
              <div className="space-y-8">
                {/* Overview Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-medical-green-50 to-medical-green-100 p-6 rounded-2xl border border-medical-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-medical-green-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-medical-green-700">Total Ratings</p>
                        <p className="text-3xl font-bold text-medical-green-800">{statistics.totalRatings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Average Score</p>
                        <p className="text-3xl font-bold text-blue-800">{statistics.totalScore.toFixed(1)}</p>
                        <p className="text-sm text-blue-600">out of 60</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Ratings */}
                <div>
                  <h3 className="text-xl font-bold text-medical-green-800 mb-6">Category Breakdown</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {RATING_CATEGORIES.map((category) => (
                      <div key={category.key} className="bg-white p-6 rounded-xl border border-medical-green-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-medical-green-800">{category.label}</h4>
                          <div className="text-2xl font-bold text-medical-green-600">
                            {statistics.averages[category.key as keyof typeof statistics.averages].toFixed(1)}
                          </div>
                        </div>
                        <div className="w-full bg-medical-green-100 rounded-full h-3 mb-2">
                          <div
                            className="bg-medical-green-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${(statistics.averages[category.key as keyof typeof statistics.averages] / 10) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-medical-green-600">out of 10</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-medical-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-medical-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-medical-green-800 mb-2">No Statistics Available</h3>
                <p className="text-medical-green-600 mb-6">Click &quot;Refresh Data&quot; to load the latest hospital quality statistics</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="medical-card p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  fhevmStatus === 'ready' ? 'bg-green-500' :
                  fhevmStatus === 'loading' ? 'bg-yellow-500 medical-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="font-medium text-medical-green-700">FHEVM: {fhevmStatus}</span>
              </div>
              {chainId && (
                <span className="text-medical-green-600">Chain: {chainId}</span>
              )}
            </div>
            {contractAddress && (
              <span className="text-xs text-medical-green-500 font-mono">
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <div className={`medical-card p-4 ${
            message.includes('Error') ? 'border-red-200 bg-red-50' :
            message.includes('success') ? 'border-green-200 bg-green-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <p className={`text-sm ${
              message.includes('Error') ? 'text-red-800' :
              message.includes('success') ? 'text-green-800' :
              'text-blue-800'
            }`}>
              {message}
            </p>
            {message.includes('Error') && (
              <button
                onClick={() => setMessage(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export const HospitalRatingDemo = HospitalRatingDemoComponent;

