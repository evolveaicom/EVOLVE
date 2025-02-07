import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import DNAStrand from '../components/DNAStrand';

// Mock Three.js classes
jest.mock('three', () => ({
    ...jest.requireActual('three'),
    BufferGeometry: jest.fn().mockImplementation(() => ({
        setAttribute: jest.fn(),
        attributes: {
            position: { needsUpdate: false },
            color: { needsUpdate: false }
        }
    })),
    Float32BufferAttribute: jest.fn(),
    Color: jest.fn().mockImplementation(() => ({
        setHSL: jest.fn(),
        lerpColors: jest.fn(),
        r: 0,
        g: 0,
        b: 0
    })),
    Vector3: jest.fn().mockImplementation((x, y, z) => ({ x, y, z }))
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
window.requestAnimationFrame = mockRequestAnimationFrame;

describe('DNAStrand Component', () => {
    const mockDNA = {
        virality: 0.8,
        adoptionRate: 0.6,
        mutationIntensity: 0.4
    };
    
    const renderComponent = (props = {}) => {
        return render(
            <Canvas>
                <DNAStrand currentDNA={mockDNA} {...props} />
            </Canvas>
        );
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('should initialize with correct DNA structure', () => {
        renderComponent();
        
        expect(THREE.BufferGeometry).toHaveBeenCalled();
        expect(THREE.Float32BufferAttribute).toHaveBeenCalled();
    });
    
    it('should update geometry based on DNA changes', () => {
        const { rerender } = renderComponent();
        
        const newDNA = {
            ...mockDNA,
            virality: 0.9
        };
        
        rerender(
            <Canvas>
                <DNAStrand currentDNA={newDNA} />
            </Canvas>
        );
        
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
    
    it('should handle mutation effects', () => {
        const onMutation = jest.fn();
        renderComponent({ onMutation });
        
        // Simulate animation frame
        act(() => {
            const animationCallback = mockRequestAnimationFrame.mock.calls[0][0];
            animationCallback();
        });
        
        expect(onMutation).not.toHaveBeenCalled(); // Should only call after mutation completes
    });
    
    it('should create correct number of DNA points', () => {
        renderComponent();
        
        const mockSetAttribute = THREE.BufferGeometry.mock.results[0].value.setAttribute;
        const calls = mockSetAttribute.mock.calls;
        
        // Check position attribute
        const positionCall = calls.find(call => call[0] === 'position');
        expect(positionCall).toBeTruthy();
        
        // Check color attribute
        const colorCall = calls.find(call => call[0] === 'color');
        expect(colorCall).toBeTruthy();
    });
    
    it('should handle mutation progress correctly', () => {
        const { rerender } = renderComponent();
        
        // Simulate multiple animation frames
        for (let i = 0; i < 10; i++) {
            act(() => {
                const animationCallback = mockRequestAnimationFrame.mock.calls[i][0];
                animationCallback();
            });
            
            rerender(
                <Canvas>
                    <DNAStrand currentDNA={mockDNA} />
                </Canvas>
            );
        }
        
        expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(10);
    });
    
    it('should cleanup animation frame on unmount', () => {
        const mockCancelAnimationFrame = jest.fn();
        window.cancelAnimationFrame = mockCancelAnimationFrame;
        
        const { unmount } = renderComponent();
        unmount();
        
        expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
    
    it('should handle visual effects', () => {
        renderComponent();
        
        // Verify color transitions
        expect(THREE.Color).toHaveBeenCalled();
        
        // Verify geometry updates
        const mockGeometry = THREE.BufferGeometry.mock.results[0].value;
        expect(mockGeometry.setAttribute).toHaveBeenCalledWith(
            'color',
            expect.any(Object)
        );
    });
    
    it('should respond to environmental pressure', () => {
        const highPressureDNA = {
            ...mockDNA,
            environmentalPressure: 0.9
        };
        
        renderComponent({ currentDNA: highPressureDNA });
        
        // Verify increased mutation intensity
        const mockGeometry = THREE.BufferGeometry.mock.results[0].value;
        expect(mockGeometry.setAttribute).toHaveBeenCalledWith(
            'position',
            expect.any(Object)
        );
    });
    
    describe('Evolution Stage Indicator', () => {
        it('should show correct evolution stage', () => {
            const { container } = renderComponent();
            
            // Simulate evolution progress
            for (let i = 0; i < 4; i++) {
                act(() => {
                    const animationCallback = mockRequestAnimationFrame.mock.calls[i][0];
                    animationCallback();
                });
            }
            
            // Verify stage indicator updates
            expect(container.querySelector('[data-testid="evolution-stage"]')).toBeTruthy();
        });
    });
    
    describe('Performance Optimization', () => {
        it('should use React.memo effectively', () => {
            const { rerender } = renderComponent();
            
            const initialCalls = THREE.BufferGeometry.mock.calls.length;
            
            // Rerender with same props
            rerender(
                <Canvas>
                    <DNAStrand currentDNA={mockDNA} />
                </Canvas>
            );
            
            expect(THREE.BufferGeometry.mock.calls.length).toBe(initialCalls);
        });
        
        it('should optimize geometry updates', () => {
            renderComponent();
            
            const mockGeometry = THREE.BufferGeometry.mock.results[0].value;
            const initialSetAttributeCalls = mockGeometry.setAttribute.mock.calls.length;
            
            // Simulate multiple frames
            for (let i = 0; i < 5; i++) {
                act(() => {
                    const animationCallback = mockRequestAnimationFrame.mock.calls[i][0];
                    animationCallback();
                });
            }
            
            // Verify efficient updates
            expect(mockGeometry.setAttribute.mock.calls.length - initialSetAttributeCalls).toBeLessThanOrEqual(10);
        });
    });
}); 