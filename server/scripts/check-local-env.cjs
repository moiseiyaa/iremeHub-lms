#!/usr/bin/env node
'use strict';
/**
 * Safe local configuration checker. Does not print or write secrets and does
 * not contact any database or external service.
 */
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({path: path.join(__dirname, '..', '.env'), quiet: true});

const uri = process.env.MONGODB_URI || '';
const secret = process.env.JWT_SECRET || '';
const problems = [];
if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
  problems.push('MONGODB_URI is missing or does not use a MongoDB connection scheme.');
}
if (secret.length < 32 || /^(replace|test|example|password|devmode|change[-_]?me)/i.test(secret)) {
  problems.push('JWT_SECRET must be a cryptographically generated, non-example value of at least 32 characters.');
}
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 22) problems.push('Node.js 22+ is required for this project.');
if (/^mongodb\+srv:\/\//.test(uri)) {
  console.warn('Notice: remote MongoDB URI detected. Use an isolated development database; never use live customer data here.');
}

if (problems.length > 0) {
  console.error('Local development configuration needs attention:');
  for (const issue of problems) console.error(' - ' + issue);
  process.exitCode = 1;
} else {
  console.log('Development environment shape is valid. No connection was attempted.');
}
