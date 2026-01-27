@echo off
REM User Frontend Setup Script

echo Setting up Legal Advisor User Frontend...

REM Install dependencies
call npm install

REM Create .env.local file if it doesn't exist
if not exist .env.local (
    copy .env.example .env.local
    echo.
    echo Created .env.local file. Please edit it with your backend API URL.
    echo.
) else (
    echo .env.local file already exists.
)

echo.
echo Setup complete! To start the development server, run:
echo   npm run dev
echo.
echo The application will be available at http://localhost:5173
