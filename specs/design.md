# Technical Design Document

## Architecture Overview

The RAG implementation consists of a React frontend, Node.js backend API, Amazon Kendra for document indexing and semantic search, and Amazon Bedrock with Claude 4 for response generation. The system follows a serverless architecture pattern using AWS CDK for infrastructure deployment.

## System Components

### Frontend (React Application)
- **Technology**: React.js with local development server
- **Purpose**: User interface for question input and response display
- **Features**:
  - Sample question display and selection
  - Custom question input field
  - Response display area
  - Loading states and error handling

### Backend API (Node.js)
- **Technology**: Node.js with Express framework
- **Runtime**: Node.js 18.x
- **Purpose**: API layer for handling requests and orchestrating AWS services
- **Endpoints**:
  - `POST /api/query` - Process user questions
  - `POST /api/ingest` - Trigger document ingestion
  - `GET /api/health` - Health check endpoint

### Document Storage and Indexing
- **Service**: Amazon Kendra
- **Purpose**: Document indexing, semantic search, and content retrieval
- **Configuration**:
  - Developer edition for cost optimization
  - Custom data source for document ingestion
  - Full document content retrieval (not snippets)

### AI Response Generation
- **Service**: Amazon Bedrock
- **Model**: Claude 4 (Anthropic)
- **Purpose**: Generate comprehensive responses based on retrieved context
- **Configuration**:
  - Temperature: 0.1 for consistent responses
  - Max tokens: 4000 for detailed responses

## Data Flow Architecture

```
User Question → React Frontend → Node.js API → Amazon Kendra (Search) → Amazon Bedrock (Generate) → Response Display
```

### Detailed Sequence Diagram

1. User submits question via React interface
2. Frontend sends POST request to `/api/query` endpoint
3. Backend receives query and calls Kendra search API
4. Kendra performs semantic search and returns relevant documents with full content
5. Backend formats retrieved content and sends to Bedrock
6. Bedrock generates comprehensive response using Claude 4
7. Backend returns formatted response to frontend
8. Frontend displays response to user

## Infrastructure Design

### AWS CDK Stack Components

#### Kendra Index
```typescript
const kendraIndex = new kendra.CfnIndex(this, 'RAGKendraIndex', {
  name: 'rag-document-index',
  edition: 'DEVELOPER_EDITION',
  roleArn: kendraRole.roleArn
});
```

#### Lambda Functions
- **Document Ingestion Lambda**: Processes documents from S3 and adds to Kendra
- **Query Processing Lambda**: Handles search and response generation
- **Runtime**: Node.js 18.x
- **Memory**: 1024 MB
- **Timeout**: 30 seconds

#### S3 Bucket
- **Purpose**: Store documents for Kendra ingestion
- **Configuration**: Private bucket with CDK-managed access

#### IAM Roles and Policies
- Kendra service role with document access permissions
- Lambda execution roles with Kendra and Bedrock permissions
- Minimal privilege principle applied

## Database Design

### DynamoDB Tables

#### Query History Table
- **Table Name**: `rag-query-history`
- **Partition Key**: `queryId` (String)
- **Attributes**:
  - `timestamp` (Number)
  - `question` (String)
  - `response` (String)
  - `documentsUsed` (List)
  - `responseTime` (Number)

#### Document Metadata Table
- **Table Name**: `rag-document-metadata`
- **Partition Key**: `documentId` (String)
- **Attributes**:
  - `fileName` (String)
  - `uploadTimestamp` (Number)
  - `fileSize` (Number)
  - `indexStatus` (String)

## API Design

### REST API Endpoints

#### POST /api/query
**Request Body:**
```json
{
  "question": "string",
  "includeHistory": "boolean"
}
```

**Response:**
```json
{
  "response": "string",
  "sources": ["string"],
  "queryId": "string",
  "responseTime": "number"
}
```

#### POST /api/ingest
**Request Body:**
```json
{
  "documentPath": "string"
}
```

**Response:**
```json
{
  "status": "success|error",
  "documentsProcessed": "number",
  "message": "string"
}
```

## Security Considerations

### Authentication and Authorization
- No authentication required for prototype (as specified)
- API endpoints protected by AWS IAM roles
- CORS configured for local development

### Data Protection
- Documents stored in private S3 bucket
- Kendra index access restricted to application roles
- No sensitive data logging

## Performance Considerations

### Response Time Optimization
- Kendra search typically responds in 1-3 seconds
- Bedrock Claude 4 generation takes 2-5 seconds
- Target total response time: < 10 seconds

### Scalability
- Lambda functions auto-scale based on demand
- Kendra Developer edition supports up to 10,000 documents
- DynamoDB on-demand pricing for variable workloads

## Error Handling

### Frontend Error States
- Network connectivity issues
- API timeout handling
- Invalid response format handling

### Backend Error Handling
- Kendra service errors
- Bedrock rate limiting
- Document processing failures
- Graceful degradation strategies

## Development and Testing Strategy

### Local Development
- React development server on port 3000
- Node.js API server on port 8000
- Mock AWS services for offline development

### Testing Approach
- Unit tests for API endpoints
- Integration tests for AWS service interactions
- End-to-end tests for complete user workflows
- Performance testing with sample document set

## Deployment Strategy

### CDK Deployment
- Single CDK stack for all AWS resources
- Environment-specific configuration
- Automated resource cleanup

### Frontend Deployment
- Local development server for testing
- Static file serving for production (future enhancement)

## Monitoring and Logging

### CloudWatch Integration
- Lambda function logs and metrics
- Kendra query performance metrics
- Bedrock usage and error tracking

### Application Logging
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance monitoring
