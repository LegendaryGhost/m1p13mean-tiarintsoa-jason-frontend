#!/usr/bin/env node

/**
 * This script reads environment variables from .env file and generates 
 * the environment.ts files for Angular
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('❌ Error loading .env file:', envConfig.error.message);
  console.log('ℹ️  Make sure you have a .env file in the root directory.');
  console.log('ℹ️  You can copy .env.example to .env and update the values.');
  process.exit(1);
}

// Get environment variables with defaults
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const PRODUCTION = process.env.PRODUCTION === 'true';

// Generate environment.ts content
const environmentDevContent = `export const environment = {
  production: false,
  apiUrl: '${API_URL}'
};
`;

// Generate environment.production.ts content
const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL_PROD || API_URL}'
};
`;

// Write environment.ts
const envDevPath = path.resolve(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(envDevPath, environmentDevContent, { encoding: 'utf8' });
console.log('✅ Generated environment.ts');

// Write environment.production.ts
const envProdPath = path.resolve(__dirname, '../src/environments/environment.production.ts');
fs.writeFileSync(envProdPath, environmentProdContent, { encoding: 'utf8' });
console.log('✅ Generated environment.production.ts');

console.log('\n🎉 Environment configuration files generated successfully!');
console.log(`📍 API URL: ${API_URL}`);
console.log(`📍 Production: ${PRODUCTION}`);
