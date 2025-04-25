//################################################################################
// Copyright (c) 2025 Hackerbot Industries LLC
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//
// Created By: Allen Chien
// Created:    April 2025
// Updated:    2025.04.20
//
// This script contains the utility functions for the Map Visualization component.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


export function lz4Decompress(compressedData, expectedSize) {
    // Create output buffer for decompressed data with expected size
    const decompressed = new Uint8Array(expectedSize);
    let dstPos = 0;
    let srcPos = 0;

    // Process each LZ4 sequence
    try {
        while (srcPos < compressedData.length && dstPos < decompressed.length) {
            // Read token byte
            const token = compressedData[srcPos++];
            
            // Get literal length (high 4 bits)
            let literalLength = token >>> 4;
            
            // Handle extended literal length (if literalLength = 15)
            if (literalLength === 15) {
                let lengthByte;
                do {
                if (srcPos >= compressedData.length) {
                    throw new Error("Unexpected end of input during literal length");
                }
                lengthByte = compressedData[srcPos++];
                literalLength += lengthByte;
                } while (lengthByte === 255);
            }
            
            // Copy literals from source to destination
            if (literalLength > 0) {
                if (srcPos + literalLength > compressedData.length) {
                const remaining = compressedData.length - srcPos;
                literalLength = remaining;
                }
                
                if (dstPos + literalLength > decompressed.length) {
                const remaining = decompressed.length - dstPos;
                literalLength = remaining;
                }
                
                // Copy literal bytes
                for (let i = 0; i < literalLength; i++) {
                decompressed[dstPos++] = compressedData[srcPos++];
                }
            }
            
            // Check if we've reached the end of the input
            if (srcPos >= compressedData.length || dstPos >= decompressed.length) {
                break;
            }
            
            // Read match offset (2 bytes little-endian)
            if (srcPos + 1 >= compressedData.length) {
                break;
            }
            
            const offset = compressedData[srcPos] | (compressedData[srcPos + 1] << 8);
            srcPos += 2;
            
            // Validate match offset (0 is invalid in LZ4)
            if (offset === 0 || offset > dstPos) {
                throw new Error(`Invalid match offset: ${offset}, dstPos: ${dstPos}`);
            }
            
            // Get match length (low 4 bits of token + 4)
            let matchLength = (token & 0x0F) + 4;
            
            // Handle extended match length (if matchLength = 19)
            if (matchLength === 19) {
                let lengthByte;
                do {
                if (srcPos >= compressedData.length) {
                    throw new Error("Unexpected end of input during match length");
                }
                lengthByte = compressedData[srcPos++];
                matchLength += lengthByte;
                } while (lengthByte === 255);
            }
            
            // Ensure we don't overflow the destination buffer
            if (dstPos + matchLength > decompressed.length) {
                const remaining = decompressed.length - dstPos;
                matchLength = remaining;
            }
            
            // Copy match data (LZ4 allows overlapping matches)
            const matchPos = dstPos - offset;
            for (let i = 0; i < matchLength; i++) {
                if (matchPos + i < 0 || matchPos + i >= dstPos) {
                throw new Error(`Invalid match position: ${matchPos + i}, valid range: 0-${dstPos-1}`);
                }
                decompressed[dstPos++] = decompressed[matchPos + i];
            }
            }
        
            return decompressed;
    } catch (error) {
        // Return partial decompression
        return decompressed;
    }
}

// Helper function to convert hex to Uint8Array
export const hexToUint8Array = (hexString) => {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return bytes;
};

  // Process map data from text content
export const processMapData = (text) => {
    try {
        // Convert hex string to binary
        const data = hexToUint8Array(text.replace(/\s/g, ''));
        const view = new DataView(data.buffer);
        
        // Extract header
        const header = {
            id: view.getInt16(0, true),
            size: view.getInt32(2, true),
            lz4_size: view.getInt32(6, true),
            width: view.getInt32(10, true),
            height: view.getInt32(14, true),
            resolution: view.getFloat32(18, true),
            origin_x: view.getFloat32(22, true),
            origin_y: view.getFloat32(26, true)
        };
        
        // Extract compressed data
        const compressedData = data.slice(30);
        
        // Decompress the data using our LZ4 implementation
        const decompressedData = lz4Decompress(compressedData, header.size);
        
        // Find unique values for coloring
        const uniqueValues = new Set();
        for (let i = 0; i < decompressedData.length; i++) {
        if (decompressedData[i] > 0) {
            uniqueValues.add(decompressedData[i]);
        }
        }
        
        // Create custom color map based on the specified hex values
        const colorMap = {
        0: '#FFFFFF',    // Free space (white)
        0x1: '#FA6930',  // RGB: 250, 105, 48
        0x5: '#F9CC29',  // RGB: 249, 204, 41
        0x9: '#46A68B',  // RGB: 70, 166, 139
        0xD: '#1F8BFA',  // RGB: 31, 139, 250
        0x11: '#F5787C', // RGB: 245, 120, 124
        0x15: '#A6E66E', // RGB: 166, 230, 110
        0x19: '#48F5C7', // RGB: 72, 245, 199
        0x1D: '#7AF5FA', // RGB: 122, 245, 250
        0x21: '#F19CA1', // RGB: 241, 156, 161
        0x25: '#75DE1F', // RGB: 117, 222, 31
        0x29: '#62E5EF', // RGB: 98, 229, 239
        0x2D: '#9D85F5', // RGB: 157, 133, 245
        0x31: '#F4C29D', // RGB: 244, 194, 157
        254: '#EEEEEE',  // Unknown (light gray)
        255: '#333333',  // Occupied (dark gray)
        };
        
        // Add default gray for any values not explicitly defined
        const defaultColor = '#939192'; // RGB: 147, 145, 146
        
        // Add any unique values that aren't already in the colorMap
        uniqueValues.forEach(value => {
        if (!colorMap[value]) {
            colorMap[value] = defaultColor;
        }
        });
        return { header, compressedData, decompressedData, colorMap };
        
    } catch (error) {
        console.error('Error processing map data:', error);
    }
};