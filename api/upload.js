// api/upload.js
const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

export const config = {
  api: { bodyParser: false }, // Penting: Matikan bodyParser bawaan Vercel
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Gagal memproses file" });

    try {
      const file = files.fileToUpload; 
      
      // FIX PENTING: Cek apakah file berupa array (formidable v3) atau object (formidable v2)
      const actualFile = Array.isArray(file) ? file[0] : file;

      if (!actualFile) {
        return res.status(400).json({ error: "Tidak ada file yang diunggah" });
      }

      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('userhash', ''); // Isi jika ada apikey catbox
      
      // Gunakan actualFile, bukan file
      catboxForm.append('fileToUpload', fs.createReadStream(actualFile.filepath), actualFile.originalFilename);

      const response = await axios.post('https://catbox.moe/user/api.php', catboxForm, {
        headers: catboxForm.getHeaders(),
      });

      // Response dari Catbox adalah link URL (string)
      res.status(200).send(response.data);
    } catch (error) {
      // Tambahkan console.log agar jika error, Anda bisa melihat alasannya di tab "Logs" Vercel
      console.error("Error saat upload ke Catbox:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
}
