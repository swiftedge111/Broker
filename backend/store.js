// User sign up
app.post('/signup', async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    try {
        // Convert email and username to lowercase for case-insensitive storage
        const lowerEmail = email.toLowerCase();
        const lowerUsername = username.toLowerCase();

        // Check if the user already exists with the same email or username
        const existingUser = await User.findOne({ 
            $or: [{ email: lowerEmail }, { username: lowerUsername }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with lowercase email and username
        const user = new User({ 
            fullName, 
            email: lowerEmail, 
            username: lowerUsername, 
            password: hashedPassword, 
            phone 
        });
        
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


 
// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("Received login request:", req.body);

    try {
        // Convert username/email to lowercase for case-insensitive comparison
        const user = await User.findOne({ 
            $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] 
        });
        
        console.log("User found in database:", user);

        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
