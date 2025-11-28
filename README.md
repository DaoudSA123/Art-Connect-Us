# Luxury Streetwear Ecommerce Website

A modern, dark-themed ecommerce website for a luxury clothing brand built with React and Node.js.

## Features

- **Dark Luxury Theme**: Premium dark navy, black, and dark maroon color scheme
- **Responsive Design**: Fully adapted for both desktop and mobile devices
- **Smooth Animations**: Subtle transitions and hover effects throughout
- **Product Showcase**: Dynamic grid displaying products from the backend API
- **Modern UI**: Clean, high-contrast design with elegant typography
- **Backend API**: Node.js/Express server with product endpoints

## Tech Stack

### Frontend
- React 18
- TailwindCSS for styling
- Custom animations and transitions
- Responsive grid layouts

### Backend
- Node.js
- Express.js
- CORS enabled for frontend communication
- RESTful API endpoints

## Project Structure

```
luxury-clothing-ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Hero.js
│   │   │   ├── ProductShowcase.js
│   │   │   ├── About.js
│   │   │   └── Footer.js
│   │   ├── App.js         # Main App component
│   │   ├── App.css        # Custom styles
│   │   └── index.css      # TailwindCSS imports
│   ├── tailwind.config.js # TailwindCSS configuration
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Express server
│   └── package.json
└── package.json          # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database (for cart and newsletter functionality)
- Klaviyo account (for SMS newsletter integration - optional)

### Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://your-production-domain.com

# Klaviyo SMS Integration (Optional)
KLAVIYO_API_KEY=your_klaviyo_private_api_key

# Stripe (if using payment integration)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**Note**: The `KLAVIYO_API_KEY` is optional. If not provided, newsletter subscriptions will still work in MongoDB but won't sync to Klaviyo.

### Installation

1. **Clone or download the project**
   ```bash
   cd luxury-clothing-ecommerce
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Create a `.env` file in the `server/` directory
   - Add the required environment variables (see above)

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Setup (Alternative)

If you prefer to set up each part separately:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Setup backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Setup frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm start
   ```

## API Endpoints

The backend provides the following endpoints:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID
- `GET /api/health` - Health check endpoint

## Design Features

### Color Palette
- **Matte Black**: #0a0a0a
- **Dark Navy**: #1a1a2e
- **Matte Maroon**: #4B1E1E

### Typography
- **Luxury Font**: Playfair Display (for headings)
- **Modern Font**: Inter (for body text)

### Animations
- Fade-in animations for content
- Slide-up animations for elements
- Hover lift effects on product cards
- Smooth transitions throughout

## Components

### Hero Section
- Large featured background image
- Bold "Shop Now" call-to-action button
- Scroll indicator animation

### Product Showcase
- Responsive grid layout
- Product cards with hover effects
- Quick view overlay
- Dynamic data from backend API

### About Section
- Brand story and mission
- Statistics display
- Decorative elements

### Footer
- Social media links
- Newsletter subscription
- Quick links and customer service
- Contact information

## Customization

### Adding New Products
Edit the `products` array in `server/index.js` to add new products:

```javascript
{
  id: 7,
  name: "New Product",
  price: 99.99,
  image: "image-url",
  category: "Category",
  description: "Product description"
}
```

### Styling
- Modify `client/tailwind.config.js` for theme customization
- Update `client/src/App.css` for additional custom styles
- Edit component files for specific styling changes

## Future Enhancements

The project is structured to easily add:
- Shopping cart functionality
- User authentication
- Payment integration
- Product search and filtering
- Admin dashboard
- Order management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project as a starting point for your own ecommerce website.
