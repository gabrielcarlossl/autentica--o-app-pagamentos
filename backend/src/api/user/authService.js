// primeiro as dependencias

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user");
const env = require("../../.env");

// expressões regulares

const emailRegex = /\S+@\S+\.\S+/; // primeiro para validar o email

const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%!]).{6,20})/; // validar senha

// tratar erros de banco de dados
const sendErrorsFromDB = (res, dbErrors) => {
  const errors = [];
  _.forIn(dbErrors.errors, (error) => errors.push(error.message));
  return res.status(400).json({ errors });
};

//metodo de login
const login = (req, res, next) => {
  const email = req.body.email || ""; // vai pegar no body da requisição o email enviado
  const password = req.body.password || ""; // vai pegar a senha que foi enviada

  // o user findOne vai fazer uma buscar dentro dos usuarios do email, um unico usuario
  User.findOne({ email }, (err, user) => {
    if (err) {
      return sendErrorsFromDB(res, err);  // caso tenha erro vai chamar a função de erros criada  
    } else if (user && bcrypt.compareSync(password, user.password)) {  // se não tiver erro vai comparar as senhas, criptografando a senha e  enviando para o banco

      // se a comparação for bem igual, vai criar um token
      const token = jwt.sign(user, env.authSecret, {
        expiresIn: "1 day",
      }); 

      // cria um json com o nome, email e o token
      const { name, email } = user;
      res.json({ name, email, token });
    } else {

      // se der erro, vai mostrar a mensagem dizendo que senha ou email está invalido
      return res.status(400).send({ errors: ["Usuário/Senha inválidos"] });
    }
  });
};

// metodo para validar token 
const validateToken = (req, res, next) => {
  const token = req.body.token || "";
  jwt.verify(token, env.authSecret, function (err, decoded) {
    return res.status(200).send({ valid: !err });
  });
};

// metodo para criar uma conta

const signup = (req, res, next) => {
  const name = req.body.name || "";
  const email = req.body.email || "";
  const password = req.body.password || "";
  const confirmPassword = req.body.confirm_password || "";
  if (!email.match(emailRegex)) { // verifica se o email está válido
    return res.status(400).send({ errors: ["O e-mail informa está inválido"] });
  }
  if (!password.match(passwordRegex)) { // valida a senha se está dentro do padrão que precisa ter os caracteres, tamanho de senha, etc
    return res
      .status(400)
      .send({
        errors: [
          "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%!) e tamanho entre 6-20.",
        ],
      });
  }
  const salt = bcrypt.genSaltSync();
  const passwordHash = bcrypt.hashSync(password, salt);  // compara as senhas, se a primeira vez digitada bate com a segunda se a comparação for falsa, vai dizer que ta errado
  if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
    return res.status(400).send({ errors: ["Senhas não conferem."] });
  }
  User.findOne({ email }, (err, user) => {  // se todas as comparações deem certo, vai ver se ja tem cadastrado esse email em algum usuario
    if (err) {
      return sendErrorsFromDB(res, err);
    } else if (user) {
      return res.status(400).send({ errors: ["Usuário já cadastrado."] }); // se o email ja estiver cadastrado vai dizer que ja tem um usuario
    } else {
      const newUser = new User({ name, email, password: passwordHash }); // se não tiver cadastrado ele vai cadastrar
      newUser.save((err) => {
        if (err) {
          return sendErrorsFromDB(res, err);
        } else {
          login(req, res, next);
        }
      });
    }
  });
};

module.exports = {
  login, signup, validateToken
}