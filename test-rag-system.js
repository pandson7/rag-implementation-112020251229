const https = require('https');

const API_BASE_URL = 'https://3n0sg4sx53.execute-api.us-east-1.amazonaws.com/prod';

const testQuestions = [
  "What are the key principles of SaaS architecture?",
  "How does multi-tenancy work in SaaS applications?",
  "What are the security considerations for SaaS platforms?",
  "Explain the data isolation strategies in SaaS architecture",
  "What are the scalability patterns for SaaS applications?"
];

async function testQuery(question) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ question });
    
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
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting RAG System Comprehensive Tests\\n');
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`📝 Test ${i + 1}: ${question}`);
    console.log('⏳ Processing...');
    
    try {
      const startTime = Date.now();
      const result = await testQuery(question);
      const endTime = Date.now();
      
      console.log('✅ Success!');
      console.log(`⏱️  Response Time: ${result.responseTime}ms (Total: ${endTime - startTime}ms)`);
      console.log(`📚 Sources: ${result.sources.join(', ')}`);
      console.log(`📄 Response Length: ${result.response.length} characters`);
      console.log(`🔍 Response Preview: ${result.response.substring(0, 200)}...`);
      console.log('\\n' + '='.repeat(80) + '\\n');
      
    } catch (error) {
      console.log('❌ Failed!');
      console.log(`Error: ${error.message}`);
      console.log('\\n' + '='.repeat(80) + '\\n');
    }
  }
  
  console.log('🎉 All tests completed!');
}

runTests();
