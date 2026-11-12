#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const {validatePublicDataset}=require('./src/validate-data.js');
try{
 const file=process.argv[2]||'docs/jobs-data.json';
 const raw=fs.readFileSync(file,'utf8');
 if(Buffer.byteLength(raw)>3*1024*1024)throw Error('3MB 제한 초과');
 const d=validatePublicDataset(JSON.parse(raw));
 console.log(`PASS ${file}: ${d.jobs.length}개 공고, ${d.companies.length}개 기업. 개인 기록 없음.`);
}catch(e){console.error(e.message);process.exit(1);}
