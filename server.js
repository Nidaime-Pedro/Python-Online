const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Lista de bibliotecas permitidas
const BIBLIOTECAS_PERMITIDAS = ["math", "random", "numpy", "pandas", "datetime", "json", "re"];

app.post("/executar", (req, res) => {
    const { codigo, entrada } = req.body;

    // Verificar se há imports não permitidos
    const linhas = codigo.split("\n");
    for (let linha of linhas) {
        if (linha.startsWith("import ") || linha.startsWith("from ")) {
            let biblioteca = linha.split(" ")[1].split(".")[0]; // Pega o nome da lib
            if (!BIBLIOTECAS_PERMITIDAS.includes(biblioteca)) {
                return res.json({ erro: `Importação não permitida: ${biblioteca}` });
            }
        }
    }

    // Criar processo Python
    const processo = spawn("python3", ["-c", codigo]);

    // Enviar entrada para o processo
    if (entrada) {
        processo.stdin.write(entrada + "\n");
        processo.stdin.end();
    }

    let saida = "";
    let erro = "";

    // Capturar saída
    processo.stdout.on("data", (data) => {
        saida += data.toString();
    });

    // Capturar erros
    processo.stderr.on("data", (data) => {
        erro += data.toString();
    });

    // Retornar resposta quando terminar
    processo.on("close", () => {
        res.json({ saida: saida.trim(), erro: erro.trim() });
    });
});

app.listen(5000, () => console.log("Servidor rodando em http://localhost:5000"));
