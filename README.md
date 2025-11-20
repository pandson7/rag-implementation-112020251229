# RAG Implementation with Web Interface

## Overview

This project implements a Retrieval Augmented Generation (RAG) system with a web interface that allows users to ask natural language questions about documents and receive comprehensive, contextually accurate responses.

## Architecture

- **Frontend**: React.js application with intuitive question interface
- **Backend**: Node.js API with Express framework
- **Document Search**: Amazon Kendra for semantic search and full content retrieval
- **AI Generation**: Amazon Bedrock with Claude 4 for comprehensive responses
- **Infrastructure**: AWS CDK for resource deployment
- **Database**: DynamoDB for query history and document metadata

## Key Features

- Natural language question processing
- Sample questions for easy interaction
- Full document content retrieval (not just snippets)
- Comprehensive AI responses based on complete context
- Support for diverse query types (broad concepts, specific details, technical patterns)
- Web interface with loading states and error handling

## Project Structure

```
rag-implementation-112020251229/
├── specs/                  # Project specifications
│   ├── requirements.md     # User stories and acceptance criteria
│   ├── design.md          # Technical architecture and design
│   └── tasks.md           # Implementation plan and tasks
├── src/                   # Backend source code
├── frontend/              # React frontend application
├── cdk-app/              # AWS CDK infrastructure code
├── tests/                # Test files
├── pricing/              # Cost analysis and estimates
├── generated-diagrams/   # Architecture diagrams
└── qr-code/             # QR codes for easy access
```

## Getting Started

1. **Prerequisites**
   - Node.js 18.x or later
   - AWS CLI configured with appropriate permissions
   - AWS CDK installed globally

2. **Setup**
   - Follow the implementation plan in `specs/tasks.md`
   - Deploy infrastructure using CDK
   - Ingest documents from `~/ea_sample_docs/rag_docs`
   - Start development servers

3. **Usage**
   - Access web interface via local development server
   - Select sample questions or input custom queries
   - View comprehensive responses with source attribution

## Document Source

The system processes documents from: `~/ea_sample_docs/rag_docs`

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Search**: Amazon Kendra
- **AI**: Amazon Bedrock (Claude 4)
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK
- **Deployment**: Local development servers

## Testing

The implementation includes comprehensive testing for:
- API endpoint functionality
- AWS service integrations
- End-to-end user workflows
- Performance and response quality
- Diverse question types and scenarios
