import axiosInstance from './axios';

export interface CreateTokenData {
	name: string;
	symbol: string;
	owner: string;
	supply: string;
	txHash: string;
	contractAddress?: string;
	chainName?: string;
	logo?: string;
}

export interface CreateTokenResponse {
	message: string;
	token?: Token;
	error?: string;
}

export interface Token {
	_id: string;
	txHash: string;
	name: string;
	symbol: string;
	owner: string;
	supply: string;
	contractAddress: string;
	chainName?: string;
	decimals?: string;
	logo?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
}

export interface GetTokensResponse {
	tokens: Token[];
	pagination: PaginationInfo;
}

export interface MemecoinNameSuggestion {
	name: string;
	symbol: string;
	description: string;
}

export interface GenerateMemecoinNamesRequest {
	theme?: string;
	keywords?: string;
	count?: number;
}

export interface GenerateMemecoinNamesResponse {
	success: boolean;
	suggestions: MemecoinNameSuggestion[];
	message?: string;
	error?: string;
}

export const getTokens = async (page = 1, limit = 10): Promise<GetTokensResponse> => {
	const response = await axiosInstance.get<GetTokensResponse>('/tokens', {
		params: { page, limit }
	});
	return response.data;
};

export const createToken = async (data: CreateTokenData): Promise<CreateTokenResponse> => {
	const response = await axiosInstance.post<CreateTokenResponse>('/create-token', data);
	return response.data;
};

export interface GetTokenByTxHashResponse {
	token: Token;
	message?: string;
	error?: string;
}

export const getTokenByTxHash = async (txhash: string): Promise<GetTokenByTxHashResponse> => {
	const response = await axiosInstance.get<GetTokenByTxHashResponse>(`/tokens/${txhash}`);
	return response.data;
};

export interface GetTokenByAddressResponse {
	token: Token;
	message?: string;
	error?: string;
}

export const getTokenByAddress = async (address: string): Promise<GetTokenByAddressResponse> => {
	const response = await axiosInstance.get<GetTokenByAddressResponse>(`/tokens/address/${address}`);
	return response.data;
};

export const generateMemecoinNames = async (
	data: GenerateMemecoinNamesRequest
): Promise<GenerateMemecoinNamesResponse> => {
	const response = await axiosInstance.post<GenerateMemecoinNamesResponse>(
		'/generate-memecoin-names',
		data
	);
	return response.data;
};

export interface GenerateDescriptionRequest {
	type: 'airdrop' | 'staking';
	tokenName: string;
	tokenSymbol: string;
	amount?: string;
	lockDays?: number;
	multiplier?: string;
}

export interface GenerateDescriptionResponse {
	success: boolean;
	description?: string;
	message?: string;
}

// ===== Airdrop Types & Functions =====

export interface Airdrop {
	_id: string;
	poolAddress: string;
	mintAddress: string;
	creatorAddress: string;
	tokenName: string;
	tokenSymbol: string;
	totalAmount: string;
	maxUsers: number;
	distributionTime: string;
	description?: string;
	isCancelled?: boolean;
	chainName?: string;
	logo?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface GetAirdropsResponse {
	airdrops: Airdrop[];
	pagination: PaginationInfo;
}

export interface GetAirdropByPoolResponse {
	airdrop: Airdrop;
	message?: string;
}

export const generateDescription = async (
	data: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> => {
	const response = await axiosInstance.post<GenerateDescriptionResponse>(
		'/generate-description',
		data
	);
	return response.data;
};

// ===== User Types & Functions =====

export interface Social {
	platform: string;
	url: string;
}

export interface User {
	address: string;
	username?: string;
	email?: string;
	avatar?: string;
	banner?: string;
	bio?: string;
	socials?: Social[];
	createdAt?: string;
	updatedAt?: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export interface ProfileResponse extends User {}

export interface UpdateUserResponse {
	message?: string;
	user?: User;
	error?: string;
}

export const loginWithWallet = async (address: string): Promise<LoginResponse> => {
	const response = await axiosInstance.post<LoginResponse>('/user/login', { address });
	return response.data;
};

export const getProfile = async (): Promise<ProfileResponse> => {
	const response = await axiosInstance.get<ProfileResponse>('/user/profile');
	return response.data;
};

export const updateUser = async (data: Partial<User>): Promise<UpdateUserResponse> => {
	const response = await axiosInstance.put<UpdateUserResponse>('/user/update', data);
	return response.data;
};

export const getUserTokens = async (): Promise<{ tokens: Token[] }> => {
	const response = await axiosInstance.get<{ tokens: Token[] }>('/user/tokens');
	return response.data;
};

// ===== Airdrop Types & Functions =====

export interface Airdrop {
	_id: string;
	poolAddress: string;
	mintAddress: string;
	creatorAddress: string;
	tokenName: string;
	tokenSymbol: string;
	totalAmount: string;
	maxUsers: number;
	distributionTime: string;
	description?: string;
	isCancelled?: boolean;
	chainName?: string;
	logo?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAirdropData {
	txSignature: string;
	poolAddress: string;
	mintAddress: string;
	creatorAddress: string;
	tokenName: string;
	tokenSymbol: string;
	totalAmount: string;
	maxUsers: number;
	distributionTime: string;
	description?: string;
	logo?: string;
}

export interface CreateAirdropResponse {
	message: string;
	airdrop?: Airdrop;
}

export interface GetAirdropsResponse {
	airdrops: Airdrop[];
	pagination: PaginationInfo;
}

export interface GetAirdropByPoolResponse {
	airdrop: Airdrop;
	message?: string;
}

export const createAirdropApi = async (data: CreateAirdropData): Promise<CreateAirdropResponse> => {
	const response = await axiosInstance.post<CreateAirdropResponse>('/airdrops', data);
	return response.data;
};

export const getAirdrops = async (page = 1, limit = 10, creator?: string): Promise<GetAirdropsResponse> => {
	const params: Record<string, string> = { page: String(page), limit: String(limit) };
	if (creator) params.creator = creator;
	const response = await axiosInstance.get<GetAirdropsResponse>('/airdrops', { params });
	return response.data;
};

export const getAirdropByPoolAddress = async (poolAddress: string): Promise<GetAirdropByPoolResponse> => {
	const response = await axiosInstance.get<GetAirdropByPoolResponse>(`/airdrops/${poolAddress}`);
	return response.data;
};

export const cancelAirdropApi = async (poolAddress: string): Promise<GetAirdropByPoolResponse> => {
	const response = await axiosInstance.put<GetAirdropByPoolResponse>(`/airdrops/${poolAddress}/cancel`);
	return response.data;
};

// ===== AI Image Generation =====

export interface GenerateImageResponse {
	imageUrl: string;
	message?: string;
}

export const generateImage = async (prompt: string): Promise<GenerateImageResponse> => {
	const response = await axiosInstance.post<GenerateImageResponse>('/generate-image', { prompt });
	return response.data;
};

export const uploadImage = async (file: File): Promise<GenerateImageResponse> => {
	const formData = new FormData();
	formData.append('file', file);
	const response = await axiosInstance.post<GenerateImageResponse>('/upload-image', formData);
	return response.data;
};

// ===== Staking Types & Functions =====

export interface StakingPool {
	_id: string;
	poolAddress: string;
	mintAddress: string;
	rewardMintAddress: string;
	creatorAddress: string;
	tokenName: string;
	tokenSymbol: string;
	rewardAmount: string;
	lockSeconds: number;
	multiplierBps: number;
	logo?: string;
	description?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateStakingPoolData {
	txSignature: string;
	poolAddress: string;
	mintAddress: string;
	rewardMintAddress: string;
	creatorAddress: string;
	tokenName: string;
	tokenSymbol: string;
	rewardAmount: string;
	lockSeconds: number;
	multiplierBps: number;
	logo?: string;
	description?: string;
}

export interface CreateStakingPoolResponse {
	message: string;
	pool?: StakingPool;
}

export interface GetStakingPoolsResponse {
	pools: StakingPool[];
	pagination: PaginationInfo;
}

export interface GetStakingPoolByAddressResponse {
	pool: StakingPool;
	message?: string;
}

export const createStakingPoolApi = async (data: CreateStakingPoolData): Promise<CreateStakingPoolResponse> => {
	const response = await axiosInstance.post<CreateStakingPoolResponse>('/staking-pools', data);
	return response.data;
};

import { stakingService } from './staking.service';

export const getStakingPools = async (page = 1, limit = 10, creator?: string, mint?: string): Promise<GetStakingPoolsResponse> => {
	try {
		// Primero intentar obtener de la API
		try {
			const params: Record<string, string> = { 
				page: String(page), 
				limit: String(limit) 
			};
			if (creator) params.creator = creator;
			if (mint) params.mint = mint;
			
			const apiResponse = await axiosInstance.get('/staking-pools', { params });
			if (apiResponse.data?.pools) {
				return apiResponse.data;
			}
		} catch (apiError) {
			// Si falla la API, leer del contrato
			console.log('API pools not found, reading from contract');
		}

		const result = await stakingService.getAllPools(page, limit);
		
		let poolsList = result.pools;
		
		// Filtrar por creator si se proporciona
		if (creator) {
			poolsList = poolsList.filter(pool => 
				pool.creator.toLowerCase() === creator.toLowerCase()
			);
		}

		// Filtrar por mint si se proporciona
		if (mint) {
			poolsList = poolsList.filter(pool => 
				pool.rewardMint.toLowerCase() === mint.toLowerCase()
			);
		}
		
		const pools: StakingPool[] = poolsList.map((pool, index) => {
			const globalIndex = (page - 1) * limit + index;
			const poolAddress = STAKING_ADDRESSES[globalIndex] || `0x${globalIndex.toString(16).padStart(40, '0')}`;
			
			return {
				_id: poolAddress,
				poolAddress: poolAddress,
				mintAddress: pool.rewardMint,
				rewardMintAddress: pool.rewardMint,
				creatorAddress: pool.creator,
				tokenName: 'Staked Token',
				tokenSymbol: 'STK',
				rewardAmount: pool.totalRewards,
				lockSeconds: pool.lockSeconds,
				multiplierBps: pool.multiplier,
				isActive: true,
			};
		});

		return {
			pools,
			pagination: {
				page: result.currentPage,
				limit: limit,
				totalPages: result.totalPages,
				total: poolsList.length,
			},
		};
	} catch (error) {
		console.error('Error fetching staking pools:', error);
		return {
			pools: [],
			pagination: {
				page: 1,
				limit: limit,
				totalPages: 1,
				total: 0,
			},
		};
	}
};

const STAKING_ADDRESSES: string[] = [];

export const getStakingPoolByAddress = async (poolAddress: string): Promise<GetStakingPoolByAddressResponse> => {
	try {
		// Primero intentar obtener de la API
		try {
			const apiResponse = await axiosInstance.get(`/staking-pools/${poolAddress}`);
			if (apiResponse.data?.pool) {
				return apiResponse.data;
			}
		} catch (apiError) {
			// Si falla la API, leer del contrato
			console.log('API pool not found, reading from contract');
		}

		const pool = await stakingService.getPoolInfoFromAddress(poolAddress);
		
		if (!pool) {
			throw new Error('Pool not found');
		}

		return {
			pool: {
				_id: poolAddress,
				poolAddress: poolAddress,
				mintAddress: pool.rewardMint,
				rewardMintAddress: pool.rewardMint,
				creatorAddress: pool.creator,
				tokenName: 'Staked Token',
				tokenSymbol: 'STK',
				rewardAmount: pool.totalRewards,
				lockSeconds: pool.lockSeconds,
				multiplierBps: pool.multiplier,
				isActive: true,
			},
		};
	} catch (error) {
		console.error('Error fetching staking pool:', error);
		throw error;
	}
};
