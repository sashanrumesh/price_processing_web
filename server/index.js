const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure file upload
const upload = multer({ dest: 'uploads/' });

// In-memory database (replace with real DB in production)
let suppliers = [];
let markupRules = [];
let postalCodeRegions = [];

// Helper functions
function applyMarkup(product, supplierId) {
  const rules = markupRules.filter(rule => 
    rule.supplierId === supplierId && 
    (!rule.category || product.category.includes(rule.category))
  );
  
  let price = product.price;
  
  rules.forEach(rule => {
    if (rule.percentage) price *= (1 + rule.percentage / 100);
    if (rule.fixedAmount) price += rule.fixedAmount;
    if (rule.minPrice) price = Math.max(price, rule.minPrice);
    if (rule.maxPrice) price = Math.min(price, rule.maxPrice);
  });
  
  return Number(price.toFixed(2));
}

function getRegionForPostalCode(postalCode) {
  const region = postalCodeRegions.find(r => 
    postalCode >= r.postalCodeStart && postalCode <= r.postalCodeEnd
  );
  return region ? region.regionName : 'Unknown';
}

// API Endpoints
app.post('/api/suppliers', (req, res) => {
  suppliers.push(req.body);
  res.status(201).send(req.body);
});

app.post('/api/markup-rules', (req, res) => {
  markupRules.push(req.body);
  res.status(201).send(req.body);
});

app.post('/api/postal-code-regions', (req, res) => {
  postalCodeRegions.push(req.body);
  res.status(201).send(req.body);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    const supplierId = parseInt(req.body.supplierId);
    const processedData = data.map(product => ({
      ...product,
      processedPrice: applyMarkup(product, supplierId),
      region: getRegionForPostalCode(product.postalCode)
    }));
    
    res.json(processedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));