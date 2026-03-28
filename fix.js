const fs = require('fs');
let content = fs.readFileSync('c:\\ET-Concierge\\app\\page.js', 'utf8');

content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, `useEffect(() => {
    fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    const interval = setInterval(() => {
      fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);`);

fs.writeFileSync('c:\\ET-Concierge\\app\\page.js', content);
console.log("Fixed useEffect block!");
