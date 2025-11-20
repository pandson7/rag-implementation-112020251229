const { KendraClient, CreateDataSourceCommand, StartDataSourceSyncJobCommand } = require('@aws-sdk/client-kendra');

const kendra = new KendraClient({ region: 'us-east-1' });

async function setupKendraDataSource() {
  try {
    const indexId = '853dc8d2-1c86-46e8-b6db-e1e39b22fd34';
    const bucketName = 'rag-documents-112020251229';
    const roleArn = 'arn:aws:iam::438431148052:role/RagImplementationStack112-KendraRole112020251229A42-Tir7SxIIi9w8';
    
    // Create data source
    const createDataSourceParams = {
      IndexId: indexId,
      Name: 'rag-s3-datasource-112020251229',
      Type: 'S3',
      Configuration: {
        S3Configuration: {
          BucketName: bucketName
        }
      },
      RoleArn: roleArn
    };

    console.log('Creating Kendra data source...');
    const createResult = await kendra.send(new CreateDataSourceCommand(createDataSourceParams));
    console.log('Data source created:', createResult.Id);

    // Start sync job
    console.log('Starting sync job...');
    const syncParams = {
      Id: createResult.Id,
      IndexId: indexId
    };

    const syncResult = await kendra.send(new StartDataSourceSyncJobCommand(syncParams));
    console.log('Sync job started:', syncResult.ExecutionId);
    
    console.log('Setup complete! Wait a few minutes for indexing to complete.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setupKendraDataSource();
