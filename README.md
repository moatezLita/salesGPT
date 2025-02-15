# SalesGPT - AI Sales Intelligence Platform 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)
![React](https://img.shields.io/badge/react-v18.0+-blue.svg)

SalesGPT is an AI-powered platform that revolutionizes sales outreach by generating highly personalized cold emails through intelligent company analysis. Leveraging Groq's Mixtral-8x7b-32768 model, it provides sales teams with deep insights and compelling message generation.

## ✨ Features

- 🔍 Intelligent website analysis and data extraction
- 💡 Advanced company insights generation
- ✉️ Personalized cold email creation
- 🔄 Batch processing capabilities
- 📊 Performance tracking and analytics

## 🏗️ System Architecture

The system consists of two main components:

1. **Chat Service (VPS)**: Handles all AI interactions using Groq's API
2. **Local Application**: Contains the business logic and frontend interface

## 🚀 Getting Started

### Prerequisites

For Docker deployment:
- Docker and Docker Compose
- Groq API key
- Bash shell (for automated deployment script)

For local development:
- Python 3.8+
- Node.js 18+
- NextJs 14.2+
- Docker and Docker Compose
- Groq API key

### Installation

#### Option 1: Automated Docker Deployment (Recommended)

1. Clone the repository
```bash
git clone https://github.com/yourusername/salesgpt.git
cd salesgpt
```

2. Set up environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. Run the deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Check for necessary prerequisites
- Create required Docker networks
- Build and start all containers
- Display service URLs and container status
- Show real-time logs

#### Option 2: Manual Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/salesgpt.git
cd salesgpt
```

2. Set up environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. Start the services using Docker Compose
```bash
docker-compose up -d --build
```

4. For local development without Docker:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

## 🛠️ Development

### Project Structure

```
salesgpt/
├── chat-service/          # VPS AI Service
├── frontend/             # React Application
└── backend/             # Business Logic Service
```

### API Documentation

API documentation is available at `http://localhost:8001/docs` after starting the backend service.

## 🤝 Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md) for guidelines on how to proceed.

### Development Process

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

If you find this project helpful, please consider giving it a star ⭐️

## 🔒 Security

For security concerns, please email moatez.litaiem@yalors.tn .

## 📧 Contact

[@Moatez Litaiem](https://www.linkedin.com/in/litaiem-moatez/)

[https://github.com/maotezLita/salesgpt](https://github.com/moatezLita/salesgpt)

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for their powerful LLM infrastructure
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework

## 📈 Roadmap

- [ ] Enhanced email personalization
- [ ] Integration with popular CRM systems
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom template builder
