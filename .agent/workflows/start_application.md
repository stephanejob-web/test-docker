---
description: Start the application using Docker Compose
---

1. Ensure your `.env` file is set up (copy from `.env.example` if needed).

2. Build and start the containers:
// turbo
docker-compose up -d --build

3. (Optional) Follow logs:
docker-compose logs -f
