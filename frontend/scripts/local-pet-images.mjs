import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const limit = 5 * 1024 * 1024;
const types = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const matches = (bytes, type) => type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';

export function localPetImages() {
    let directory;
    const middleware = async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        const upload = pathname === '/local-api/pet-images';
        const filename = pathname?.match(/^\/arquivos\/pets\/([a-f0-9-]+\.(?:jpg|png|webp))$/)?.[1];
        if (!upload && !filename) return next();
        const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
        try {
            if (upload) {
                if (req.method !== 'POST') return json(405, { message: 'Método não permitido.' });
                // Prevent other sites from using this local disk upload service.
                if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return json(403, { message: 'Origem não permitida.' });
                const type = req.headers['content-type'];
                if (!types[type]) return json(415, { message: 'Use JPEG, PNG ou WebP.' });
                const chunks = [];
                let size = 0;
                for await (const chunk of req) {
                    size += chunk.length;
                    if (size > limit) return json(413, { message: 'A imagem deve ter até 5 MB.' });
                    chunks.push(chunk);
                }
                const bytes = Buffer.concat(chunks);
                if (!matches(bytes, type)) return json(415, { message: 'Conteúdo de imagem inválido.' });
                const name = `${randomUUID()}.${types[type]}`;
                await mkdir(directory, { recursive: true });
                await writeFile(resolve(directory, name), bytes, { flag: 'wx' });
                return json(201, { fotoUrl: `/arquivos/pets/${name}` });
            }
            if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, { message: 'Método não permitido.' });
            const bytes = await readFile(resolve(directory, filename));
            const type = Object.keys(types).find(key => filename.endsWith(`.${types[key]}`));
            res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=31536000, immutable' });
            res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch (error) {
            json(error.code === 'ENOENT' ? 404 : 500, { message: 'Não foi possível acessar a imagem local.' });
        }
    };
    return {
        name: 'local-pet-images',
        configResolved(config) { directory = resolve(config.root, '.local-storage/pets'); },
        configureServer(server) { server.middlewares.use(middleware); },
        configurePreviewServer(server) { server.middlewares.use(middleware); },
    };
}
