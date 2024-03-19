const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user (name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Registro realizado com Sucesso" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res
          .status(400)
          .json({ message: "O email já existe em nosso banco de dados" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Usuário ou senha incorretos!" });
      } else if (results[0].status === "false") {
        return res
          .status(401)
          .json({ message: "Aguarde a aprovação do Gerente" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const acessToken = jwt.sign(response, process.env.ACESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: acessToken });
      } else {
        return res
          .status(400)
          .json({ message: "Algo deu errado, Por favor tente mais tarde!" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email,password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(500)
          .json({ message: "Este email não existe em nosso Banco de Dados." });
      } else {
        var mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Senha do Cafe Management System",
          html:
            "<p><b>Detalhes do seu login para Cafe Management System</b><br><br><br> <b> Email:</b> " +
            results[0].email +
            " <br><br><br><b>Password: </b> " +
            results[0].password +
            '<br><br><br><a href="http://localhost:4200/">Click aqui para fazer login</a></p>',
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            return (
              res
                .status(200)
                .json({ message: "Senha Enviada com sucesso para seu Email" }) +
              console.log("Email enviado com sucesso!:" + info.response)
            );
          }
        });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  var query =
    "select id,name,email,contactNumber,status from user where role ='user'";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Usuário não existe" });
        }
        return res
          .status(200)
          .json({ message: "Usuário autorizado com sucesso" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  console.log(email);
  var query = "select *from user where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Senha antiga incorreta!" });
      } else if (results[0].password == user.oldPassword) {
        query = "update user set password=? where email=?";
        connection.query(query, [user.newPassword, email], (err, results) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "Senha atualizada com sucesso!" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res
          .status(400)
          .json({ message: "Algo deu errado, tente mais tarde!" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
