const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); 
const app = express();


// Serve static files from the frontend folder

app.use(express.static(path.join(__dirname, '../frontend')));

// Route to serve home.html for the homepage

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connected to DB:", mongoose.connection.name);
  })



const authenticateJWT = (req, res, next) => {
    console.log('Authenticating JWT...');
    
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('Authorization token missing');
        return res.status(401).json({  
            success: false,
            message: 'Authorization token required'
        });
    }

    console.log('Received Token:', token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', {
                error: err,
                message: err.message,
                expiredAt: err.expiredAt
            });
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token',
                suggestion: 'Please login again'
            });
        }

        console.log('Decoded Token:', decoded);     
        req.user = {
            id: decoded.id,       
            iat: decoded.iat,
            exp: decoded.exp
        };
        
        next();
    });
};


//configuaring emiail transporter

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER_WELCOME,
    pass: process.env.EMAIL_PASS_WELCOME  
  } 
})


// User Schema
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    lastLogin: {type: String, default: null},
    status: {type: String, default: "Inactive"}, 
    uid: { type: String, required: true, unique: true },
    totalBalance: { type: Number, default: 0 },  
    holdings: [
        {
            name: { type: String },
            symbol: { type: String },
            amount: { type: Number },
            value: { type: Number }
        }
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

});

const User = mongoose.model('User', UserSchema);

// Admin Model (add to your existing models)
const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

const Admin = mongoose.model('Admin', AdminSchema);

 
// deposit schema definition and model
const depositSchema = new mongoose.Schema({
  method: { type: String, required: true },
  bankDetails: {
      bankName: String,
      routingNumber: String,
      accountNumber: String,
      accountName: String,
      swiftCode: String,
  },
  cryptoDetails: [
      {
          cryptocurrency: { type: String, required: true },
          walletAddress: String,
          network: String,
      },
  ],
  digitalWalletDetails: [
      {
          walletType: { type: String, required: true },
          walletUsername: String,
          walletInfo: String,
      },
  ],
});
const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = { Deposit };


//PIN GENERATION DATABASE

// PIN Schema definition and model
const pinSchema = new mongoose.Schema({
  pinCode: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
  expirationAt: { type: Date, required: true }, 
  status: { type: String, enum: ['active', 'expired'], default: 'active' } 
});


const Pin = mongoose.model('Pin', pinSchema);

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uid: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['holding', 'manual', 'crypto', 'bank'], 
    required: true 
  },
  details: { type: Object },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rejected'], 
    default: 'completed' 
  },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);


// Fetch Bank Transfer Data
app.get('/admin/deposit/bank-transfer', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'bank-transfer' });
    res.json(deposit || {});
  } catch (error) {
    console.error('Error fetching bank transfer data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Bank Transfer Data
app.post('/admin/deposit/bank-transfer', authenticateJWT, async (req, res) => {
  const { bankName, routingNumber, accountNumber, accountName, swiftCode } = req.body;
  try {
    let deposit = await Deposit.findOneAndUpdate(
      { method: 'bank-transfer' },
      { 
        bankDetails: { 
          bankName, 
          routingNumber, 
          accountNumber, 
          accountName, 
          swiftCode 
        },
        $unset: { cryptoDetails: "", digitalWalletDetails: "" }   
      },
      { new: true, upsert: true }
    );
    res.json(deposit);
  } catch (error) {
    console.error('Error saving bank transfer data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch Cryptocurrency Data
app.get('/admin/deposit/crypto', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'crypto' });
    res.json(deposit?.cryptoDetails || []);
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Save Cryptocurrency Data
app.post('/admin/deposit/crypto', authenticateJWT, async (req, res) => {
  const { cryptocurrency, walletAddress, network } = req.body;

  try {
    // Find the deposit document for 'crypto'
    let deposit = await Deposit.findOne({ method: 'crypto' });

    // If the deposit document exists
    if (deposit) {
      // Check if the cryptocurrency already exists in the array
      const existingCrypto = deposit.cryptoDetails.find(
        (crypto) => crypto.cryptocurrency === cryptocurrency
      );

      if (existingCrypto) {
        // If the cryptocurrency exists, update only that entry
        await Deposit.updateOne(
          { method: 'crypto', 'cryptoDetails.cryptocurrency': cryptocurrency },
          {
            $set: {
              'cryptoDetails.$.walletAddress': walletAddress,
              'cryptoDetails.$.network': network,
            },
          }
        );
      } else {
        // If the cryptocurrency doesn't exist, add it to the array
        await Deposit.updateOne(
          { method: 'crypto' },
          {
            $push: {
              cryptoDetails: {
                cryptocurrency,
                walletAddress,
                network,
              },
            },
          }
        );
      }
    } else {
      // If the 'crypto' deposit document doesn't exist, create it
      deposit = new Deposit({
        method: 'crypto',
        cryptoDetails: [{ cryptocurrency, walletAddress, network }],
      });
      await deposit.save();
    }

    // Now, ensure that if there are any unwanted fields, like 'digitalWalletDetails', they are excluded or unset
    await Deposit.updateOne(
      { method: 'crypto' },
      {
        $unset: { digitalWalletDetails: "" }, // Remove 'digitalWalletDetails' if unnecessary
      }
    );

    res.status(200).json({ message: 'Cryptocurrency details saved successfully!' });
  } catch (error) {
    console.error('Error saving cryptocurrency data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch Digital Wallets Data
app.get('/admin/deposit/digital-wallets', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'digital-wallets' });
    res.json(deposit?.digitalWalletDetails || []);
  } catch (error) {
    console.error('Error fetching digital wallet data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Digital Wallet Data
app.post('/admin/deposit/digital-wallets', authenticateJWT, async (req, res) => {
  const { walletType, walletUsername, walletInfo } = req.body;

  try {
    // Find the deposit document for 'digital-wallets'
    let deposit = await Deposit.findOne({ method: 'digital-wallets' });

    // If the deposit document exists
    if (deposit) {
      // Check if the walletType already exists in the array
      const existingWallet = deposit.digitalWalletDetails.find(
        (wallet) => wallet.walletType === walletType
      );

      if (existingWallet) {
        // If the walletType exists, update only that entry
        await Deposit.updateOne(
          { method: 'digital-wallets', 'digitalWalletDetails.walletType': walletType },
          {
            $set: {
              'digitalWalletDetails.$.walletUsername': walletUsername,
              'digitalWalletDetails.$.walletInfo': walletInfo,
            },
          }
        );
      } else {
        // If the walletType doesn't exist, add it to the array
        await Deposit.updateOne(
          { method: 'digital-wallets' },
          {
            $push: {
              digitalWalletDetails: {
                walletType,
                walletUsername,
                walletInfo,
              },
            },
          }
        );
      }
    } else {
      // If the 'digital-wallets' deposit document doesn't exist, create it
      deposit = new Deposit({
        method: 'digital-wallets',
        digitalWalletDetails: [{ walletType, walletUsername, walletInfo }],
      });
      await deposit.save();
    }

    // Now, ensure that if there are any unwanted fields, like 'cryptoDetails', they are excluded or unset
    await Deposit.updateOne(
      { method: 'digital-wallets' },
      {
        $unset: { cryptoDetails: "" }, // Remove 'cryptoDetails' if unnecessary
      }
    );

    res.status(200).json({ message: 'Digital wallet details saved successfully!' });
  } catch (error) {
    console.error('Error saving digital wallet data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Sample route to get deposit details from the database
app.get('/api/deposit-details', async (req, res) => {
  try {
      const depositDetails = await Deposit.findOne(); // Fetch the first deposit details document (you may adjust based on your data model)
      
      if (!depositDetails) {
          return res.status(404).send('Deposit details not found');
      }
      
      res.json(depositDetails); // Send back the deposit details in JSON format
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});


//welcome email sending function

function getWelcomeEmailTemplate(user) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4361ee; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Our Platform!</h1>
                </div>
                <div class="content">
                    <p>Hello ${user.fullName},</p>
                    <p>Thank you for creating an account with us. We're excited to have you on board!</p>
                    <p>Your account details:</p>
                    <ul>
                        <li><strong>Username:</strong> ${user.username}</li>
                        <li><strong>Email:</strong> ${user.email}</li>
                    </ul>
                    <p>If you have any questions, feel free to reply to this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Swiftedge Trade. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function getPlainTextWelcomeEmail(user) {
    return `
        Welcome to Our Platform!
        
        Hello ${user.fullName},
        
        Thank you for creating an account with us. We're excited to have you on board!
        
        Your account details:
        - Username: ${user.username}
        - Email: ${user.email}
        
        If you have any questions, feel free to reply to this email.
        
        © ${new Date().getFullYear()} Swiftedge Trade. All rights reserved.
    `;
}
  

// User sign up and login routes...

app.post('/signup', async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    try {
        const lowerEmail = email.toLowerCase();
        const lowerUsername = username.toLowerCase();

        // Check if the user already exists with the same email or username
        const existingUser = await User.findOne({ 
            $or: [
                { email: lowerEmail },
                { username: lowerUsername }
            ]
        });

        if (existingUser) {
            if (existingUser.email === lowerEmail) {
                return res.status(400).json({ 
                    message: 'Email already registered',
                    resolution: 'Try logging in or use a different email'
                });
            } else {
                return res.status(400).json({ 
                    message: 'Username already taken',
                    resolution: 'Please choose a different username'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a shortened UID
        const uid = uuidv4().slice(0, 8);

        // Create new user
        const user = new User({ 
            fullName, 
            email: lowerEmail, 
            username: lowerUsername, 
            password: hashedPassword, 
            phone,
            uid,  
            balance: 0,  
            holdings: []  
        });
        
        await user.save();

        // Send welcome email
        sendWelcomeEmail(user).catch(console.error);

        res.status(201).json({ 
            message: 'Account created successfully',
            nextSteps: 'Check your email for a welcome message'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Registration service temporarily unavailable',
            resolution: 'Please try again in a few minutes'
        });
    }
});

// Email sending function
async function sendWelcomeEmail(user) {
    try {
        const mailOptions = {
            from: `"Swiftedge Trade" <${process.env.EMAIL_USER_WELCOME}>`,
            to: user.email,
            subject: 'Welcome to Our Platform!',
            text: getPlainTextWelcomeEmail(user),
            html: getWelcomeEmailTemplate(user)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}


// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Convert input to lowercase for case-insensitive comparison
      const loginInput = username.toLowerCase();
      
      // Check if input is email format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput);
      
      // Find user by either username or email
      const user = await User.findOne({
          $or: [
              { username: loginInput },
              { email: isEmail ? loginInput : null } // Only check email if input looks like email
          ]
      });

      if (!user) {
          return res.status(400).json({ 
              message: 'Account not found',
              suggestion: 'Please check your login details or sign up for a new account'
          });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ 
              message: 'Incorrect password',
              resolution: 'Please try again or reset your password'
          });
      }

      user.status = 'Active';
      user.lastLogin = new Date().toISOString();
      await user.save();

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

      res.json({ 
          token, 
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          message: 'Login successful'
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
          message: 'Login service temporarily unavailable',
          resolution: 'Please try again later'
      });
  }
});



//Backend to get user details

app.get('/user-info', async (req, res) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch the user based on the decoded user ID
        const user = await User.findById(decoded.id).select('username uid status lastLogin');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with user information
        res.json({
            username: user.username,
            uid: user.uid,
            status: user.status,
            lastLogin: user.lastLogin,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch Holdings for a User by UID
app.get('/admin/user-holdings/:uid', authenticateJWT, async (req, res) => {
    const { uid } = req.params;  

    try {
        
        const user = await User.findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            holdings: user.holdings   
        });

    } catch (error) {
        console.error('Error fetching user holdings:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

//Add holdings

app.post('/admin/add-holding', authenticateJWT, async (req, res) => {
    const { uid, name, symbol, amount, value } = req.body;

    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Store previous balance for notification
        const previousBalance = user.totalBalance || 0;

        // Add the new holding
        user.holdings.push({ name, symbol, amount, value });

        // Create a transaction record
        const transaction = new Transaction({
            userId: user._id,
            uid: user.uid,
            type: 'credit',
            amount: value,  
            method: 'holding',
            details: {
                assetName: name,
                assetSymbol: symbol,
                units: amount
            },
            status: 'completed'
        });

        await transaction.save();

        // Recalculate totalBalance based on all holdings
        user.totalBalance = user.holdings.reduce((sum, h) => sum + h.value, 0);
        await user.save();

        // Send notification if balance increased
        if (user.totalBalance > previousBalance) {
            try {
                await sendFundingNotification(
                    user.email,
                    user.totalBalance - previousBalance,
                    user.totalBalance
                );
                console.log(`Funding notification sent to ${user.email}`);
            } catch (emailError) {
                console.error('Failed to send funding notification:', emailError);
                // Continue even if email fails
            }
        }

        res.json({ 
            message: 'Holding added successfully', 
            holdings: user.holdings,
            totalBalance: user.totalBalance
        });
    } catch (error) {
        console.error('Error adding holding:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Backend route to get user portfolio
app.get('/portfolio', authenticateJWT, async (req, res) => {
  try {
      console.log('Incoming request to /portfolio');
      console.log('Decoded User:', req.user); // Log user from JWT

      const user = await User.findById(req.user.id);
      if (!user) {
          console.log('User not found in the database');
          return res.status(404).json({ message: 'User not found' });
      }

      console.log('Fetched user from database:', user);

      res.json({
          totalBalance: user.totalBalance,   
          holdings: user.holdings            
      });
  } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


// Password Reset Request Route
app.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 3600000;  

      // Save token and expiry to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpiry;
      await user.save();

      // Generate reset link with query parameter
      const resetLink = `https://www.swiftedgetrade.com/update-password.html?token=${resetToken}`;

      // Send reset email
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: process.env.EMAIL_USER_WELCOME,
              pass: process.env.EMAIL_PASS_WELCOME,
          },
      });

      const mailOptions = {
          from: '"Swiftedge Trade" <no-reply@swiftedge.com',
          to: user.email,
          subject: 'Password Reset Request',
          text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
          html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
      console.error('Error in /request-reset:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


//api route to verify token

app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },  
      });

      if (!user) {
          return res.status(400).send('Invalid or expired token');
      }

      // Redirect to the update password page
      res.redirect(`/update-password.html?userId=${user._id}`);
  } catch (error) {
      console.error('Error in /reset-password/:token:', error);
      res.status(500).send('Server error');
  }
});



//reset password route

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body; 
 
  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
          console.log("Token not found or expired in database:", token); // Log if token is invalid or expired
          return res.status(400).json({ message: 'Invalid or expired token' });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("New password hashed successfully");

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log("Password updated successfully for user:", user.email);
      res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
      console.error("Error in /reset-password/:token route:", error);  
      res.status(500).json({ message: 'Server error' });
  }
});


// Seed Admin logs
async function seedAdmin() {
    try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            const admin = new Admin({
                username: 'admin',
                email: 'swiftedgetrade@gmail.com',
                password: hashedPassword
            });
            await admin.save();
            console.log('Default admin account created');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}

seedAdmin();

// Admin Login Route 
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return res.status(401).json({ 
                message: 'Invalid username or password',
                field: 'username'
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid username or password',
                field: 'password'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password Route
app.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'No account with that email exists' });
        }

        // Create reset token (expires in 1 hour)
        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; 
        await admin.save();

        // Send email
        const resetUrl = `${process.env.BASE_URL}/reset-password.html?token=${resetToken}`;
        
        const mailOptions = {
            to: admin.email,
            from: process.env.EMAIL_FROM,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset for your admin account.</p>
                <p>Click this link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password Route
app.post('/admin/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password Route (requires auth)
app.post('/admin/change-password', authenticateAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Current password is incorrect',
                field: 'currentPassword'
            });
        }

        // Update password
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}

//Route to generate pin
const SALT_ROUNDS = 10;  


// Generate PIN API

app.post('/admin/generate-pin', authenticateJWT, async (req, res) => {
  const { pinLength, expirationTime } = req.body;

  console.log("===== BACKEND LOGS =====");
  console.log("Received pinLength (from frontend):", pinLength);
  console.log("Received expirationTime (from frontend):", expirationTime);

  try {
    // Validate input
    if (![4, 6].includes(pinLength)) {
      console.error("Error: PIN length must be 4 or 6 digits.");
      return res.status(400).json({ message: 'PIN length must be 4 or 6 digits' });
    }

    if (!expirationTime || isNaN(expirationTime)) {
      console.error("Error: Valid expiration time is required.");
      return res.status(400).json({ message: 'Valid expiration time is required' });
    }

    // Generate random PIN
    const rawPin = Array(pinLength)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join(''); // Generate a random 4 or 6-digit PIN
    console.log("Generated raw PIN:", rawPin);

    // Encrypt the PIN
    const encryptedPin = await bcrypt.hash(rawPin, SALT_ROUNDS);
    console.log("Encrypted PIN:", encryptedPin);

    // Calculate expiration timestamp
    const expirationAt = new Date(Date.now() + expirationTime * 60 * 1000); // Convert minutes to milliseconds
    console.log("Calculated expirationAt (timestamp):", expirationAt);

    // Save the PIN to the database
    const pin = new Pin({
      pinCode: encryptedPin,
      expirationAt,
    });

    await pin.save();
    console.log("PIN saved to database successfully.");

    // Return the raw PIN and expiration details to the admin
    res.status(200).json({
      message: 'PIN generated successfully',
      pin: rawPin, // Send the raw PIN to the admin
      expirationAt,
    });
  } catch (error) {
    console.error("Error generating PIN:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running background job to expire PINs...');
  try {
      const result = await Pin.updateMany(
          { status: 'active', expirationAt: { $lt: new Date() } },
          { status: 'expired' }
      );

      if (result.modifiedCount > 0) {
          console.log(`${result.modifiedCount} PIN(s) marked as expired.`);
      } else {
          console.log('No PINs to expire at this time.');
      }
  } catch (error) {
      console.error('Error expiring PINs:', error);
  }
});

// Verify PIN Route
app.post('/verify-pin', async (req, res) => {
  const { pin } = req.body;

  // Validate PIN input
  if (!pin || (pin.length !== 4 && pin.length !== 6)) {
    return res.status(400).json({ message: 'Invalid PIN format. PIN must be 4 or 6 digits.' });
  }

  try {
    // Search for the PIN in the database (regardless of status or expiration)
    const pinRecords = await Pin.find({});  

    let pinMatch = null;
    for (const record of pinRecords) {
      const isMatch = await bcrypt.compare(pin, record.pinCode);
      if (isMatch) {
        pinMatch = record;
        break;
      }
    }

    if (!pinMatch) {
      // PIN does not exist in the database
      return res.status(400).json({ message: 'Invalid PIN. Please try again.' });
    }

    // Check if the PIN is expired
    if (pinMatch.expirationAt < new Date() || pinMatch.status === 'expired') {
      return res.status(404).json({ message: 'PIN expired. Please request a new PIN.' });
    }

    // PIN is valid and active
    return res.status(200).json({
      message: 'Transaction approved! The money is on its way to your bank.',
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Route to delete all pins
app.delete('/admin/pins', authenticateJWT, async (req, res) => {
  try {
      await Pin.deleteMany({}); // Delete all pins from the database
      res.status(200).json({ message: 'All pins have been successfully deleted.' });
  } catch (error) {
      console.error('Error deleting pins:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// funding notification

async function sendFundingNotification(email, amount, newBalance) {
  if (!process.env.EMAIL_USER_WELCOME || !transporter) {
    console.error('Email configuration is incomplete');
    throw new Error('Email service not properly configured');
  }

  const mailOptions = {
    from: `"SwiftEdge Trade" <${process.env.EMAIL_USER_WELCOME}>`,  
    to: email,
    subject: 'Your Trading Account Has Been Funded',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Account Funding Notification</h2>
        <p>Hello,</p>
        <p>Your trading account has been successfully funded.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount Credited:</strong> $${amount.toFixed(2)}</p>
          <p><strong>New Account Balance:</strong> $${newBalance.toFixed(2)}</p>
        </div>
        
        <p>If you have any questions or didn't initiate this funding, please contact our support team immediately.</p>
        
        <p>Best regards,<br>SwiftEdge Trade Team</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #6c757d;">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send funding notification');
  }
}


// Backend Logic for withdrawals and Transactions history

// Admin middleware
const ADMIN_UIDS = ['admin123', 'admin456'];  

const adminOnly = (req, res, next) => {
  if (req.user && ADMIN_UIDS.includes(req.user.uid)) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

 
//Transaction History Route

// Get user transactions with pagination
app.get('/api/transactions', authenticateJWT, async (req, res) => {
    try {
        const { page = 1, limit = 10, filter } = req.query;
        const skip = (page - 1) * limit;
        
        const query = { userId: req.user.id };
        if (filter && ['credit', 'debit'].includes(filter)) {
            query.type = filter;
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



//Withdrawal Request Route and Admin Approval

// POST /api/withdraw - Create withdrawal request
app.post('/api/withdraw', authenticateJWT, async (req, res) => {
    try {
        console.log('Received withdrawal request:', {
            headers: req.headers,
            body: req.body,
            user: req.user
        });

        const { amount, method, walletAddress, bankDetails, cryptoType } = req.body;
        const userId = req.user.id; // Changed from _id to id to match JWT structure

        console.log('Looking for user with ID:', userId);

        // Verify user exists
        const user = await User.findById(userId).select('+totalBalance');
        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ 
                success: false,
                error: 'User not found',
                userId: userId,
                suggestion: 'Check if user exists in database'
            });
        }

        console.log('Found user:', {
            id: user._id,
            email: user.email,
            balance: user.totalBalance
        });

        // Validate amount
        if (!amount || isNaN(amount)) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid amount',
                received: amount
            });
        }

        if (amount <= 0) {
            console.error('Non-positive amount:', amount);
            return res.status(400).json({ 
                success: false,
                error: 'Amount must be positive',
                received: amount
            });
        }

        // Validate method
        if (!method || !['crypto', 'bank'].includes(method)) {
            console.error('Invalid method:', method);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid withdrawal method',
                received: method,
                validMethods: ['crypto', 'bank']
            });
        }

        // Method-specific validation
        if (method === 'crypto') {
            if (!walletAddress || !cryptoType) {
                console.error('Missing crypto fields:', { walletAddress, cryptoType });
                return res.status(400).json({ 
                    success: false,
                    error: 'Wallet address and crypto type are required',
                    received: { walletAddress, cryptoType }
                });
            }
        } else {
            if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber) {
                console.error('Incomplete bank details:', bankDetails);
                return res.status(400).json({ 
                    success: false,
                    error: 'Bank details are incomplete',
                    requiredFields: ['bankName', 'accountNumber'],
                    received: bankDetails
                });
            }
        }

        // Check sufficient balance (with 5% buffer for fees)
        if (user.totalBalance < amount * 1.05) {
            console.error('Insufficient balance:', {
                currentBalance: user.totalBalance,
                requiredAmount: amount * 1.05
            });
            return res.status(400).json({ 
                success: false,
                error: 'Insufficient balance (including potential fees)',
                currentBalance: user.totalBalance,
                requiredAmount: amount * 1.05,
                feePercentage: 5
            });
        }

        // Create withdrawal record
        const withdrawal = new Transaction({
            userId,
            uid: user.uid,
            type: 'debit',
            amount,
            method,
            details: {
                ...(method === 'crypto' ? { 
                    walletAddress,
                    cryptoType 
                } : bankDetails),
                pinVerified: true
            },
            status: 'pending'
        });

        await withdrawal.save();

        console.log('Withdrawal created successfully:', withdrawal);

        res.json({ 
            success: true, 
            message: 'Withdrawal request submitted for admin approval',
            withdrawalId: withdrawal._id,
            record: withdrawal
        });

    } catch (error) {
        console.error('Withdrawal processing error:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            user: req.user
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/admin/withdrawals/pending - Get pending withdrawals
app.get('/api/admin/withdrawals/pending', authenticateJWT, authenticateAdmin, async (req, res) => {
    try {
        const pendingWithdrawals = await Transaction.find({
            type: 'debit',
            status: 'pending'
        }).populate('userId', 'fullName uid email');

        res.json({ 
            success: true, 
            withdrawals: pendingWithdrawals 
        });

    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/admin/withdrawals/:id/process - Process withdrawal
app.post('/api/admin/withdrawals/:id/process', authenticateJWT, authenticateAdmin, async (req, res) => {
    try {
        const { action } = req.body;  
        const transactionId = req.params.id;

        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ 
                success: false,
                error: 'Transaction not found' 
            });
        }

        // Verify it's a pending withdrawal
        if (transaction.type !== 'debit' || transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false,
                error: 'Not a pending withdrawal' 
            });
        }

        // Find the user
        const user = await User.findById(transaction.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Process based on action
        if (action === 'approve') {
            // Check if user has sufficient balance (again, in case it changed)
            if (user.totalBalance < transaction.amount) {
                return res.status(400).json({ 
                    success: false,
                    error: 'User has insufficient balance' 
                });
            }

            // Deduct from user's balance
            user.totalBalance -= transaction.amount;
            await user.save();

            // Update transaction
            transaction.status = 'completed';
            transaction.processedBy = req.user.id;
            transaction.processedAt = new Date();
            await transaction.save();

            res.json({ 
                success: true,
                message: 'Withdrawal approved successfully',
                newBalance: user.totalBalance
            });

        } else if (action === 'reject') {
            // Update transaction
            transaction.status = 'rejected';
            transaction.processedBy = req.user.id;
            transaction.processedAt = new Date();
            await transaction.save();

            res.json({ 
                success: true,
                message: 'Withdrawal rejected successfully'
            });

        } else {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid action' 
            });
        }

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || 'https://swift-edge-backend.onrender.com';
const INTERVAL = 14 * 60 * 1000;  

setInterval(() => {
  fetch(`${KEEP_ALIVE_URL}/health`)
    .then(() => console.log('✅ Keep-alive ping successful'))
    .catch(err => console.error('❌ Keep-alive ping failed:', err));
}, INTERVAL);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 