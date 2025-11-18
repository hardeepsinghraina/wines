'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

export default function TestProductsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function runTests() {
      const tests = [
        { name: 'All Products (limit 5)', url: '/api/products?limit=5' },
        { name: 'Search: Red', url: '/api/products?search=Red&limit=5' },
        { name: 'Search: White', url: '/api/products?search=White&limit=5' },
        { name: 'Search: Champagne', url: '/api/products?search=Champagne&limit=5' },
        { name: 'Category: Red Wine', url: '/api/products?category=Red%20Wine&limit=5' },
        { name: 'Category: Champagne', url: '/api/products?category=Champagne&limit=5' },
      ];

      const testResults = [];

      for (const test of tests) {
        try {
          const fullUrl = getApiUrl(test.url);
          console.log(`Testing: ${test.name} - ${fullUrl}`);
          
          const response = await fetch(fullUrl);
          const data = await response.json();
          
          testResults.push({
            name: test.name,
            url: fullUrl,
            status: response.status,
            success: data.success,
            winesCount: data.data?.wines?.length || 0,
            data: data
          });
        } catch (error: any) {
          testResults.push({
            name: test.name,
            url: getApiUrl(test.url),
            error: error.message
          });
        }
      }

      setResults(testResults);
    }

    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Product API Test Results</h1>
      
      {results.map((result, index) => (
        <div 
          key={index} 
          style={{ 
            margin: '20px 0', 
            padding: '15px', 
            border: '1px solid #ccc',
            background: result.error ? '#f8d7da' : '#d4edda'
          }}
        >
          <h3>{result.name}</h3>
          <p><strong>URL:</strong> {result.url}</p>
          
          {result.error ? (
            <p><strong>Error:</strong> {result.error}</p>
          ) : (
            <>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Success:</strong> {String(result.success)}</p>
              <p><strong>Wines Count:</strong> {result.winesCount}</p>
              <details>
                <summary>View Full Response</summary>
                <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
