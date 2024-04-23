-- Criar o banco de dados cafenodejs
CREATE DATABASE IF NOT EXISTS cafenodejs;

-- Usar o banco de dados cafenodejs
USE cafenodejs;

-- Criar a tabela 'user' se ainda não existir
CREATE TABLE IF NOT EXISTS `user` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(250),
    contactNumber VARCHAR(20),
    email VARCHAR(50) UNIQUE,
    password VARCHAR(250),
    status VARCHAR(20),
    role VARCHAR(20)
);

-- Inserir um usuário padrão (se necessário)
INSERT INTO `user` (name, contactNumber, email, password, status, role) 
VALUES ('ramon', '96988888888', 'admin@gmail.com', 'admin', 'true', 'admin');

-- Criar a tabela 'category' se ainda não existir
CREATE TABLE IF NOT EXISTS category (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

-- Criar a tabela 'product' se ainda não existir
CREATE TABLE IF NOT EXISTS product (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    categoryId INT NOT NULL,
    description VARCHAR(255),
    price INT,
    status VARCHAR(20),
    PRIMARY KEY(id)
);

-- Criar a tabela 'bill' se ainda não existir
CREATE TABLE IF NOT EXISTS bill (
    id INT NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(200) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(20) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    total INT NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
);
