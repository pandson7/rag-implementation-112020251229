const { KendraClient, StartDataSourceSyncJobCommand } = require('@aws-sdk/client-kendra');

const kendra = new KendraClient({ region: 'us-east-1' });

async function startSync() {
  try {
    const syncParams = {
      Id: '9ad5637e-1e24-4edb-a6ff-b453dcb690f6', // Data source ID from earlier
      IndexId: '853dc8d2-1c86-46e8-b6db-e1e39b22fd34'
    };

    console.log('Starting sync job...');
    const syncResult = await kendra.send(new StartDataSourceSyncJobCommand(syncParams));
    console.log('Sync job started:', syncResult.ExecutionId);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

startSync();
