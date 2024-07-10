const mysql = require("mysql");
require("dotenv").config();

let connection;

function connectionDB() {
  connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (!err) {
      console.log(`Conectado ${process.env.PORT}` );
    } else {
      console.error("Erro ao conectar:", err);
      reconnect();
    }
  });
}

function reconnect() {
  const tryMax = 3;
  let tentativa = 0;

  function retryConnection() {
    if (tentativa < tryMax) {
      tentativa++;
      console.log(`Tentando reconectar... Tentativa ${tentativa}`);
      connectionDB();
    } else {
      console.error(
        "Número máximo de tentativas atingido. Não foi possível reconectar."
      );
    }
  }

  setTimeout(retryConnection, 5000);
}

connectionDB();

module.exports = connection;
