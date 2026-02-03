document.getElementById('create-location-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const body = {
    locationName: data.get('locationName'),
    primaryPhone: data.get('primaryPhone'),
    websiteUri: data.get('websiteUri'),
    primaryCategory: { displayName: data.get('primaryCategory') },
    address: {
      addressLines: [data.get('addressLines')],
      locality: data.get('locality'),
      administrativeArea: data.get('administrativeArea'),
      postalCode: data.get('postalCode'),
      regionCode: data.get('regionCode')
    }
  };

  try {
    const resp = await fetch('http://localhost:3000/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await resp.json();
    document.getElementById('result').textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    document.getElementById('result').textContent = 'Erro: ' + err.message;
  }
});