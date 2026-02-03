document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData();
  const locationId = form.locationId.value.trim();
  const files = form.querySelector('input[name="photos"]').files;
  if (!locationId) {
    document.getElementById('result').textContent = 'Location ID é obrigatório.';
    return;
  }
  if (!files || files.length === 0) {
    document.getElementById('result').textContent = 'Selecione ao menos uma foto.';
    return;
  }
  for (const f of files) fd.append('photos', f);

  try {
    const resp = await fetch(`http://localhost:3000/api/locations/${encodeURIComponent(locationId)}/photos`, {
      method: 'POST',
      body: fd
    });
    const json = await resp.json();
    document.getElementById('result').textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    document.getElementById('result').textContent = 'Erro: ' + err.message;
  }
});