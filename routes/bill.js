const express = require("express");
const connection = require("../connection");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const auth = require("../services/authentication");
const authentication = require("../services/authentication");

const puppeteer = require("puppeteer");

router.post("/generateReport", auth.authenticateToken, async (req, res) => {
  const generateUuid = uuid.v1();
  const orderDetails = req.body;
  const productDetailsReport = JSON.parse(orderDetails.productDetails);

  try {
    // Inserir os detalhes do pedido no banco de dados
    const query =
      "INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await connection.query(query, [
      orderDetails.name,
      generateUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      res.locals.email,
    ]);

    // Renderizar o arquivo EJS para HTML
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "", "report.ejs"),
      {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
      }
    );

    // Configurar o Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Gerar o PDF
    const pdfPath = `./generated_pdf/${generateUuid}.pdf`;
    await page.pdf({ path: pdfPath });

    // Fechar o navegador Puppeteer
    await browser.close();

    // Responder com o UUID gerado
    return res.status(200).json({ uuid: generateUuid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao gerar o relatório PDF" });
  }
});

router.post("/getPdf", auth.authenticateToken, async (req, res) => {
  const orderDetails = req.body;
  const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;

  if (fs.existsSync(pdfPath)) {
    // Se o PDF existir, envie-o como resposta
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    // Se o PDF não existir, gere-o
    try {
      // Renderizar o arquivo EJS para HTML
      const productDetailsReport = JSON.parse(orderDetails.productDetails);
      const htmlContent = await ejs.renderFile(
        path.join(__dirname, "", "report.ejs"),
        {
          productDetails: productDetailsReport,
          name: orderDetails.name,
          email: orderDetails.email,
          contactNumber: orderDetails.contactNumber,
          paymentMethod: orderDetails.paymentMethod,
          totalAmount: orderDetails.totalAmount,
        }
      );

      // Configurar o Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      // Gerar o PDF
      await page.pdf({ path: pdfPath });

      // Fechar o navegador Puppeteer
      await browser.close();

      // Enviar o PDF gerado como resposta
      res.contentType("application/pdf");
      fs.createReadStream(pdfPath).pipe(res);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Erro ao gerar ou enviar o relatório PDF" });
    }
  }
});

router.get("/getBills", auth.authenticateToken, (req, res, next) => {
  var query = "select *from bill order by id DESC";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.delete("/delete/:id", auth.authenticateToken, (req, res, next) => {
  const id = req.params.id;
  var query = "delete from bill where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "Conta não encontrada." });
      }
      return res.status(200).json({ message: "Conta deletada com sucesso" });
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
