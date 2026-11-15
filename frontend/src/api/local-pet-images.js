export async function saveLocalPetImage(file) {
    const response = await fetch('/local-api/pet-images', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Não foi possível salvar a foto localmente.');
    if (!/^\/arquivos\/pets\/[a-f0-9-]+\.(jpg|png|webp)$/.test(result.fotoUrl)) throw new Error('Resposta inesperada ao salvar a foto.');
    return new URL(result.fotoUrl, window.location.origin).href;
}
