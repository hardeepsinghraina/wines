# Database Setup Guide

Choose one of the following options to set up a database for development:

## 🐘 Option 1: PostgreSQL with Docker (Recommended)

**Prerequisites**: Docker Desktop installed

### Quick Setup
```bash
cd backend
npm run setup:db
```

This will:
- Start a PostgreSQL container
- Create the database
- Run migrations
- Set up the schema

### Manual Setup
```bash
# Start PostgreSQL container
docker-compose -f docker-compose.dev.yml up -d

# Wait a moment, then run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: luxury_wine_db
- **Username**: postgres
- **Password**: password

## 📁 Option 2: SQLite (Simple, Limited Features)

**Prerequisites**: None

### Quick Setup
```bash
cd backend
npm run setup:sqlite
```

**Note**: SQLite has limitations:
- No native Decimal type (uses Float)
- No array fields (uses JSON strings)
- Some advanced features may not work

## 🔧 Option 3: Manual PostgreSQL

If you have PostgreSQL installed locally:

1. **Create Database**:
   ```sql
   CREATE DATABASE luxury_wine_db;
   ```

2. **Update Environment**:
   ```bash
   # Edit backend/.env
   DATABASE_URL="postgresql://your_user:your_password@localhost:5432/luxury_wine_db"
   ```

3. **Run Migrations**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## 🚀 After Setup

1. **Start Backend**:
   ```bash
   npm run start
   ```

2. **Verify Connection**:
   - Check logs for "Database connected successfully"
   - Visit: http://localhost:5000/health

## 🛠 Database Management

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Seed Database (Optional)
```bash
npm run db:seed
```

## 🐳 Docker Commands

### Stop Database
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs
```

### Remove Everything
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## 🔍 Troubleshooting

### "Connection refused"
- Ensure Docker is running
- Check if port 5432 is available
- Wait a few seconds after starting container

### "Migration failed"
- Stop and restart the container
- Check if database exists
- Verify connection string

### "Prisma generate failed"
- Run `npm install` to ensure dependencies
- Check schema syntax
- Try `npx prisma generate --force`

## 💡 Development Tips

- Use **PostgreSQL** for full feature compatibility
- Use **SQLite** for quick prototyping
- Database runs in background with Docker
- Data persists between container restarts