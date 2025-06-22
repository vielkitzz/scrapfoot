const express = require('express');
const fs = require('fs');
const path = require('path');
const { createSerializedObjectFromYaml, writeSerializedObj } = require('./brasfoot_editor_module.js'); // Usaremos uma versão modularizada

const app = express();
const port = 3000;

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json({ limit: '10mb' }));

// Servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para realizar a conversão
app.post('/converter', (req, res) => {
    try {
        const yamlData = req.body;
        if (!yamlData) {
            return res.status(400).send({ error: 'Nenhum dado YAML recebido.' });
        }

        // Usa a função importada para criar o objeto serializável
        const ser = createSerializedObjectFromYaml(yamlData);
        
        const tempFileName = `temporario-${Date.now()}.ban`;
        const tempFilePath = path.join(__dirname, tempFileName);

        // Usa a função original para escrever o objeto no arquivo .ban
        writeSerializedObj(ser, tempFilePath);

        // Envia o arquivo para download e o exclui depois
        res.download(tempFilePath, 'time.ban', (err) => {
            if (err) {
                console.error("Erro ao enviar o arquivo:", err);
            }
            // Limpa o arquivo temporário
            fs.unlinkSync(tempFilePath);
        });

    } catch (error) {
        console.error("Erro durante a conversão:", error);
        res.status(500).send({ error: 'Falha ao converter o arquivo.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});