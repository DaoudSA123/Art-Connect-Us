@echo off
echo 🚀 Setting up Luxury Streetwear Ecommerce Website...

echo 📦 Installing root dependencies...
npm install

echo 📦 Installing server dependencies...
cd server
npm install
cd ..

echo 📦 Installing client dependencies...
cd client
npm install
cd ..

echo ✅ All dependencies installed successfully!
echo.
echo 🎉 Setup complete! To start the development servers:
echo    npm run dev
echo.
echo This will start:
echo    - Backend server on http://localhost:5000
echo    - Frontend server on http://localhost:3000
echo.
echo Happy coding! 🎨
pause
