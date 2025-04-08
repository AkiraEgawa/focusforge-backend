import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// OAuth Token Exchange Endpoint
app.post("/auth/token", async (req, res) => {
    const { code } = req.body;
    
    // Log environment variables (only in development)
    if (process.env.NODE_ENV !== 'production') {
        console.log("🔐 Received authorization code:", code);
        console.log("🔧 Env values being used:");
        console.log("CLIENT_ID:", process.env.CLIENT_ID);
        console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
        console.log("REDIRECT_URI:", process.env.REDIRECT_URI);
    }

    const requiredParams = [
        { param: code, name: 'code' },
        { param: process.env.CLIENT_ID, name: 'CLIENT_ID' },
        { param: process.env.CLIENT_SECRET, name: 'CLIENT_SECRET' },
        { param: process.env.REDIRECT_URI, name: 'REDIRECT_URI' }
    ];

    const missingParam = requiredParams.find(p => !p.param);
    if (missingParam) {
        return res.status(400).json({
            error: `Missing required parameter: ${missingParam.name}`
        });
    }

    try {
        const response = await axios.post("https://todoist.com/oauth/access_token", {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
        });
        
        const access_token = response.data.access_token;
        res.json({ access_token });
    } catch (err) {
        console.error("❌ Error exchanging code with Todoist:", err);
        res.status(500).json({ 
            error: err.response?.data || "Failed to exchange code" 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});