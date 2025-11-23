#!/bin/bash

# Setup script for RecruiterGuard environment files

echo "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
  if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env from .env.example"
  else
    cat > backend/.env << EOF
DATABASE_URL="mysql://user:password@localhost:3306/recruiter_guard"
SHADOW_DATABASE_URL="mysql://root:rootpassword@localhost:3306/recruiter_guard_shadow"
PORT=3001
SESSION_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3000"
EOF
    echo "✓ Created backend/.env"
  fi
else
  echo "⚠ backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
  if [ -f "frontend/.env.local.example" ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "✓ Created frontend/.env.local from .env.local.example"
  else
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo "✓ Created frontend/.env.local"
  fi
else
  echo "⚠ frontend/.env.local already exists, skipping..."
fi

echo ""
echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update backend/.env with your settings"
echo "2. Review and update frontend/.env.local if needed"
echo "3. Start MySQL: docker-compose up -d"
echo "4. Run migrations: cd backend && npm run migrate"
echo "5. Start backend: cd backend && npm run dev"
echo "6. Start frontend: cd frontend && npm run dev"

