import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DarwinMeme, EvolutionEngine } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('EVOLVE Protocol Evolution Tests', () => {
    let darwinMeme: DarwinMeme;
    let evolutionEngine: EvolutionEngine;
    let owner: SignerWithAddress;
    let users: SignerWithAddress[];
    
    beforeEach(async () => {
        [owner, ...users] = await ethers.getSigners();
        
        // Deploy contracts
        const DarwinMeme = await ethers.getContractFactory('DarwinMeme');
        darwinMeme = await DarwinMeme.deploy(
            ethers.utils.parseEther('1000000000'), // 1B initial supply
            owner.address // AI operator
        );
        await darwinMeme.deployed();
    });
    
    describe('Mutation Mechanics', () => {
        it('should propose valid mutations', async () => {
            const symbols = ['EvoV2Phoenix', 'EvoV2Dragon', 'EvoV2Hydra'];
            const rates = [5, 3, 7];
            const dnaHashes = [
                'QmHash1...',
                'QmHash2...',
                'QmHash3...'
            ];
            
            await expect(darwinMeme.proposeMutations(symbols, rates, dnaHashes))
                .to.emit(darwinMeme, 'MutationProposed')
                .withArgs(0);
                
            const proposal = await darwinMeme.currentProposals(0);
            expect(proposal.newSymbol).to.equal(symbols[0]);
            expect(proposal.newBurnRate).to.equal(rates[0]);
        });
        
        it('should reject invalid mutation proposals', async () => {
            const invalidRates = [11, 12, 13]; // Rates > 10%
            await expect(
                darwinMeme.proposeMutations(
                    ['EvoV2A', 'EvoV2B', 'EvoV2C'],
                    invalidRates,
                    ['Hash1', 'Hash2', 'Hash3']
                )
            ).to.be.revertedWith('Invalid burn rate');
        });
        
        it('should enforce mutation cycle timing', async () => {
            // Propose initial mutations
            await darwinMeme.proposeMutations(
                ['EvoV2A', 'EvoV2B', 'EvoV2C'],
                [3, 4, 5],
                ['Hash1', 'Hash2', 'Hash3']
            );
            
            // Try to propose again before cycle ends
            await expect(
                darwinMeme.proposeMutations(
                    ['EvoV3A', 'EvoV3B', 'EvoV3C'],
                    [3, 4, 5],
                    ['Hash4', 'Hash5', 'Hash6']
                )
            ).to.be.revertedWith('Existing proposals');
        });
    });
    
    describe('Voting System', () => {
        beforeEach(async () => {
            // Setup proposals
            await darwinMeme.proposeMutations(
                ['EvoV2A', 'EvoV2B', 'EvoV2C'],
                [3, 4, 5],
                ['Hash1', 'Hash2', 'Hash3']
            );
            
            // Transfer tokens to users
            for (const user of users.slice(0, 3)) {
                await darwinMeme.transfer(
                    user.address,
                    ethers.utils.parseEther('1000000')
                );
            }
        });
        
        it('should allow token holders to vote', async () => {
            const userInstance = darwinMeme.connect(users[0]);
            await expect(userInstance.voteForMutation(0))
                .to.emit(darwinMeme, 'VoteCast')
                .withArgs(users[0].address, 0);
                
            const proposal = await darwinMeme.currentProposals(0);
            expect(proposal.voteCount).to.be.gt(0);
        });
        
        it('should burn tokens when voting', async () => {
            const userInstance = darwinMeme.connect(users[0]);
            const initialBalance = await darwinMeme.balanceOf(users[0].address);
            
            await userInstance.voteForMutation(0);
            
            const finalBalance = await darwinMeme.balanceOf(users[0].address);
            expect(finalBalance).to.be.lt(initialBalance);
        });
        
        it('should prevent non-holders from voting', async () => {
            const nonHolder = users[5]; // No tokens transferred
            const nonHolderInstance = darwinMeme.connect(nonHolder);
            
            await expect(
                nonHolderInstance.voteForMutation(0)
            ).to.be.revertedWith('No tokens');
        });
    });
    
    describe('Evolution Process', () => {
        beforeEach(async () => {
            // Setup and vote
            await darwinMeme.proposeMutations(
                ['EvoV2A', 'EvoV2B', 'EvoV2C'],
                [3, 4, 5],
                ['Hash1', 'Hash2', 'Hash3']
            );
            
            // Transfer and vote
            for (const user of users.slice(0, 3)) {
                await darwinMeme.transfer(
                    user.address,
                    ethers.utils.parseEther('1000000')
                );
                await darwinMeme.connect(user).voteForMutation(0);
            }
        });
        
        it('should apply winning mutation', async () => {
            // Fast forward time
            await ethers.provider.send('evm_increaseTime', [86400]); // 24 hours
            await ethers.provider.send('evm_mine', []);
            
            await expect(darwinMeme.applyMutation())
                .to.emit(darwinMeme, 'MutationApplied');
                
            expect(await darwinMeme.symbol()).to.equal('EvoV2A');
        });
        
        it('should update burn rate after mutation', async () => {
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine', []);
            
            await darwinMeme.applyMutation();
            
            expect(await darwinMeme.burnRate()).to.equal(3);
        });
        
        it('should clear proposals after mutation', async () => {
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine', []);
            
            await darwinMeme.applyMutation();
            
            await expect(
                darwinMeme.currentProposals(0)
            ).to.be.revertedWith('Invalid proposal');
        });
    });
    
    describe('Environmental Pressure', () => {
        it('should affect burn rate', async () => {
            const initialBurnRate = await darwinMeme.burnRate();
            
            await darwinMeme.updateEnvironmentalPressure(75); // High pressure
            
            const newBurnRate = await darwinMeme.burnRate();
            expect(newBurnRate).to.be.gt(initialBurnRate);
        });
        
        it('should trigger extinction under extreme conditions', async () => {
            // Setup extinction conditions
            await darwinMeme.updateEnvironmentalPressure(100); // Maximum pressure
            
            // Propose and apply mutation with low survival rate
            await darwinMeme.proposeMutations(
                ['EvoV2Extinct', 'EvoV2B', 'EvoV2C'],
                [3, 4, 5],
                ['Hash1', 'Hash2', 'Hash3']
            );
            
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine', []);
            
            await darwinMeme.applyMutation();
            
            expect(await darwinMeme.symbol()).to.equal('EXTINCT');
            expect(await darwinMeme.burnRate()).to.equal(100);
        });
    });
    
    describe('Genetic Inheritance', () => {
        it('should inherit traits from parent mutations', async () => {
            // First generation
            await darwinMeme.proposeMutations(
                ['EvoV2A', 'EvoV2B', 'EvoV2C'],
                [3, 4, 5],
                ['Hash1', 'Hash2', 'Hash3']
            );
            
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine', []);
            
            await darwinMeme.applyMutation();
            
            // Second generation
            await darwinMeme.proposeMutations(
                ['EvoV3A', 'EvoV3B', 'EvoV3C'],
                [4, 5, 6],
                ['Hash4', 'Hash5', 'Hash6']
            );
            
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine', []);
            
            await darwinMeme.applyMutation();
            
            const mutation = await darwinMeme.mutationHistory(1);
            expect(mutation.parentDNA).to.equal(0);
        });
    });
}); 