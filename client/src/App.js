import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [file, setFile] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [markupRules, setMarkupRules] = useState([]);
  const [postalRegions, setPostalRegions] = useState([]);

  // Form states
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    location: '',
    postalCode: '',
    country: ''
  });

  const [newMarkupRule, setNewMarkupRule] = useState({
    supplierId: '',
    category: '',
    percentage: '',
    fixedAmount: '',
    minPrice: '',
    maxPrice: '',
    region: ''
  });

  const [newPostalRegion, setNewPostalRegion] = useState({
    countryCode: '',
    postalCodeStart: '',
    postalCodeEnd: '',
    regionName: ''
  });

  // Fetch initial data
  useEffect(() => {
    // In a real app, you would fetch from API
    setSuppliers([
      { id: 1, name: 'Supplier A', location: 'Berlin', postalCode: '10115', country: 'Germany' }
    ]);
    setMarkupRules([
      { id: 1, supplierId: 1, category: 'Electronics', percentage: 10 }
    ]);
    setPostalRegions([
      { id: 1, countryCode: 'DE', postalCodeStart: '10000', postalCodeEnd: '19999', regionName: 'Berlin' }
    ]);
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || !file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('supplierId', selectedSupplier);

    try {
      const response = await axios.post('/api/upload', formData);
      setProcessedData(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownload = () => {
    // Implement download functionality
    alert('Download functionality would be implemented here');
  };

  return (
    <div className="app">
      <header>
        <h1>Price Processing Engine</h1>
      </header>

      <main>
        <section className="upload-section">
          <h2>Upload Supplier Catalog</h2>
          <form onSubmit={handleFileUpload}>
            <div className="form-group">
              <label>Supplier:</label>
              <select 
                value={selectedSupplier} 
                onChange={(e) => setSelectedSupplier(e.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Excel File:</label>
              <input 
                type="file" 
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            
            <button type="submit">Process File</button>
          </form>
        </section>

        {processedData.length > 0 && (
          <section className="results-section">
            <h2>Processing Results</h2>
            <button onClick={handleDownload}>Download Processed File</button>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>EAN</th>
                  <th>Original Price</th>
                  <th>Processed Price</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.ean}</td>
                    <td>{item.price} €</td>
                    <td>{item.processedPrice} €</td>
                    <td>{item.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;