import express from 'express';
import axios   from 'axios';
import dotenv  from 'dotenv';
import cors    from 'cors';  // Fixed the import

dotenv.config();

const app = express();
const PORT = 4000;  // Added fallback port
const url=process.env.URL

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get('/api/currency',async(req,res)=>{
  try {
    const {data}= await axios.get(`${url}/v1/fiat/map`, {
        headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_KEY },
      })
      res.json({data})
  } catch (error) {
    console.log(error)
  }
})


app.get('/api/convert', async (req, res) => {
  const { amount, from, to, time } = req.query;
  
  // Basic validation
  if (!amount || !from || !to) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['amount', 'from', 'to'],
    });
  }

  try {
    const { data } = await axios.get(
      `${url}/v2/tools/price-conversion`,
      {
        headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_KEY },
        params: {
          amount,
          symbol: from,
          convert: to,
          time // optional historical timestamp
        }
      }
    );
    res.json(data);
  } catch (e) {
    console.error('API Error:', e.response?.data || e.message);
    res.status(e.response?.status || 500).json({
      error: 'Conversion failed',
      details: e.response?.data || e.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Crypto API running on port ${PORT}`);
});