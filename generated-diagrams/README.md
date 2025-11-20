# RAG Implementation - AWS Architecture Diagrams

## Overview
This directory contains AWS architecture diagrams generated based on the technical design specifications for the RAG (Retrieval-Augmented Generation) implementation project.

## Generated Diagrams

### 1. Main Architecture Diagram (`rag_architecture.png`)
**Purpose**: Complete system overview showing all components and their relationships
**Components**:
- React Frontend (Port 3000)
- Node.js API Backend (Port 8000)
- Amazon Kendra (Developer Edition) for document search
- Amazon Bedrock with Claude 4 for AI response generation
- Lambda functions for serverless processing
- DynamoDB tables for data storage
- S3 bucket for document storage
- CloudWatch for monitoring

### 2. Data Flow Sequence (`rag_data_flow.png`)
**Purpose**: Step-by-step visualization of the query processing flow
**Flow Steps**:
1. User submits question via React interface
2. Frontend sends POST request to API
3. API invokes Query Processing Lambda
4. Lambda searches documents in Kendra
5. Kendra returns relevant context
6. Lambda sends context to Bedrock Claude 4
7. Bedrock generates AI response
8. Lambda stores query history in DynamoDB
9. Response returned through API to frontend
10. User sees the generated answer

### 3. Document Ingestion Flow (`document_ingestion_flow.png`)
**Purpose**: Shows how documents are processed and indexed
**Components**:
- Document upload to S3 bucket
- API endpoint `/api/ingest` for triggering ingestion
- Document Ingestion Lambda function
- Kendra indexing process
- Metadata storage in DynamoDB

### 4. CDK Infrastructure Deployment (`cdk_infrastructure.png`)
**Purpose**: Infrastructure as Code deployment architecture
**Components**:
- AWS CDK stack definition
- Lambda functions with Node.js 18.x runtime
- Storage and database resources
- AI/ML service configurations
- IAM roles and security policies
- CloudWatch monitoring setup

### 5. Security & IAM Architecture (`security_iam.png`)
**Purpose**: Security model and permission structure
**Components**:
- Lambda execution roles
- Kendra service role
- Least privilege access policies
- Service-to-service permissions
- Resource access patterns

## Technical Specifications

### Key AWS Services Used
- **Amazon Kendra**: Developer Edition for semantic search
- **Amazon Bedrock**: Claude 4 model for response generation
- **AWS Lambda**: Node.js 18.x runtime, 1024 MB memory, 30s timeout
- **Amazon DynamoDB**: On-demand pricing for variable workloads
- **Amazon S3**: Private bucket for document storage
- **Amazon CloudWatch**: Comprehensive logging and monitoring

### Performance Characteristics
- **Target Response Time**: < 10 seconds total
- **Kendra Search**: 1-3 seconds typical
- **Bedrock Generation**: 2-5 seconds typical
- **Document Capacity**: Up to 10,000 documents (Developer Edition)

### Security Features
- IAM roles with least privilege access
- Private S3 bucket configuration
- No authentication required (prototype specification)
- CORS configured for local development
- No sensitive data logging

## File Locations
All diagrams are stored in: `~/echo-architect-artifacts/rag-implementation-112020251229/generated-diagrams/`

## Usage Notes
- Diagrams are generated in PNG format for easy viewing and sharing
- Each diagram focuses on a specific aspect of the architecture
- Use these diagrams for documentation, presentations, and development reference
- All diagrams follow AWS architecture best practices and conventions

## Generated On
Date: November 20, 2024
Time: 12:35 PM EST
Agent: Diagram Generator Agent
