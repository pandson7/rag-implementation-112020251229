const https = require('https');
const http = require('http');

console.log('🔍 Final RAG System Validation\\n');

// Test 1: Backend API Health
console.log('1. Testing Backend API Health...');
const testBackend = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ question: "Test question" });
    
    const options = {
      hostname: '3n0sg4sx53.execute-api.us-east-1.amazonaws.com',
      port: 443,
      path: '/prod/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.response) {
            console.log('   ✅ Backend API is working');
            console.log(`   📊 Response time: ${result.responseTime}ms`);
            resolve(true);
          } else {
            console.log('   ❌ Backend API returned unexpected response');
            resolve(false);
          }
        } catch (error) {
          console.log('   ❌ Backend API returned invalid JSON');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Backend API connection failed');
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

// Test 2: Frontend Health
console.log('2. Testing Frontend Health...');
const testFrontend = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Frontend is accessible');
        resolve(true);
      } else {
        console.log('   ❌ Frontend returned status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', () => {
      console.log('   ❌ Frontend is not accessible');
      resolve(false);
    });

    req.end();
  });
};

// Test 3: Document Retrieval Quality
console.log('3. Testing Document Retrieval Quality...');
const testRetrieval = () => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ 
      question: "What is the fundamental principle that distinguishes SaaS architecture?" 
    });
    
    const options = {
      hostname: '3n0sg4sx53.execute-api.us-east-1.amazonaws.com',
      port: 443,
      path: '/prod/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.response && result.response.length > 500 && result.sources.length > 0) {
            console.log('   ✅ High-quality retrieval confirmed');
            console.log(`   📄 Response length: ${result.response.length} characters`);
            console.log(`   📚 Sources found: ${result.sources.length}`);
            resolve(true);
          } else {
            console.log('   ❌ Low-quality retrieval detected');
            resolve(false);
          }
        } catch (error) {
          console.log('   ❌ Retrieval test failed');
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.log('   ❌ Retrieval test connection failed');
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

async function runValidation() {
  const backendResult = await testBackend();
  const frontendResult = await testFrontend();
  const retrievalResult = await testRetrieval();
  
  console.log('\\n📋 Validation Summary:');
  console.log(`   Backend API: ${backendResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Frontend: ${frontendResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Document Retrieval: ${retrievalResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = backendResult && frontendResult && retrievalResult;
  console.log(`\\n🎯 Overall Status: ${allPassed ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ ISSUES DETECTED'}`);
  
  if (allPassed) {
    console.log('\\n🚀 RAG System is ready for use!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: https://3n0sg4sx53.execute-api.us-east-1.amazonaws.com/prod');
  }
}

runValidation();
