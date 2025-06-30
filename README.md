<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# ProFinder - Professional Directory Platform

A comprehensive platform for connecting users with verified professionals across various fields.

## Features

### User Management
- User registration and authentication
- Role-based access control (User, Admin, Super Admin)
- Profile management

### Enhanced Admin Verification System
- **Contact Information**: Mobile number and email address collection
- **Interactive Location Picker**: Google Maps integration for precise location selection
- **Form Validation**: Comprehensive form validation using Formik and Yup
- **Identity Document Upload**: Admins can upload valid identity documents for verification
  - Aadhar Card (required)
  - Voter ID (optional)
  - Supports JPG, PNG, and PDF formats (max 5MB)
- Professional information submission
- Verification workflow by Super Admins

### Professional Directory
- Search and filter verified professionals
- Location-based search with map integration
- Profession-based categorization
- Experience level filtering

### Super Admin Panel
- Review pending admin applications
- View uploaded identity documents
- Verify admin profiles
- Manage the verification process

## Technical Stack

### Frontend
- React.js
- Material-UI (MUI)
- Redux Toolkit
- Axios for API calls
- Formik for form management
- Yup for form validation
- Google Maps API for location services

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Enhanced Admin Form Features

### Contact Information
- Mobile number validation (10 digits)
- Email address validation
- Required field validation

### Location Services
- Interactive Google Maps integration
- Current location detection
- Draggable marker for precise location selection
- Coordinate storage (latitude/longitude)

### Form Validation
- Real-time validation feedback
- Comprehensive error messages
- Field-specific validation rules
- Form submission prevention until valid

## File Upload Features

### Supported Formats
- Images: JPG, PNG
- Documents: PDF
- Maximum file size: 5MB per file

### Security
- File type validation
- File size limits
- Secure file storage in uploads directory
- Static file serving for document access

## API Endpoints

### Admin Routes
- `POST /api/admin/submit` - Submit admin application with identity documents and contact info
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/verified` - Get verified admins
- `GET /api/admin/search` - Search professionals

### Super Admin Routes
- `GET /api/superadmin/pending` - Get pending admin applications
- `POST /api/superadmin/verify/:id` - Verify admin application

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```
3. Set up environment variables (see Google Maps setup below)
4. Start the development servers:
   ```bash
   # Frontend
   npm start
   
   # Backend
   cd server && npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory:
```
# Google Maps API Key (required for location picker)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL
REACT_APP_API_URL=http://localhost:5000
```

Create a `.env` file in the server directory:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Google Maps Setup

The enhanced admin form includes Google Maps integration for location selection. Follow the setup guide in `GOOGLE_MAPS_SETUP.md` to configure your API key.

### Quick Setup:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Add the API key to your `.env` file
4. Restrict the API key to your domain for security

## Usage

1. Register as a user
2. Apply for admin verification by submitting:
   - Professional information
   - Contact details (mobile, email)
   - Location selection via interactive map
   - At least one identity document (Aadhar Card or Voter ID)
3. Super admins can review and verify applications
4. Verified admins appear in the professional directory

## File Structure

```
profinder/
├── src/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── AdminForm.js   # Enhanced admin form with validation
│   │   └── LocationMap.js # Google Maps location picker
│   ├── pages/            # Page components
│   └── api/              # API configuration
├── server/               # Backend Node.js code
│   ├── models/           # MongoDB models (updated with new fields)
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # File upload directory
│   └── controllers/      # Route controllers (updated)
└── public/               # Static assets
```

## Technologies Used

- **Frontend**: React, Material-UI, Redux Toolkit, Formik, Yup, Google Maps API
- **Backend**: Node.js, Express, MongoDB

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
=======
# profinder
>>>>>>> 310c951e700e70ee9c5e35145e4039e244b2a6aa
