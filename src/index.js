//importamos o express para facilitar o trabalho
//acrecentamos o nodemon para facilitar o desenvolvimento, 
//pois com ele não é preciso reiniciar o servidor para que as 
//novas informações sejam apresentadas
const express = require('express');

const { v4: uuid, validate: isUuid } = require('uuid'); //gera ids aleatórios

const app = express();

//Informa que será recebido JSON, tem que vir antes das rotas
app.use(express.json());

const projects = [];

//Middleware
function logRequests(request, response, next) {
  //sera disparado de forma automatica em todas as rotas
  const { method, url } = request; //pega os metodo e a url

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();//precisa ser chamado para que o proximo middleware seja chamado, no caso a rota

  console.timeEnd(logLabel);//sera exibido somente dps que a rota for executada
}

function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID' });
  }

  return next();
}//verifica se o id informado é compativel com o uuid

app.use(logRequests);
app.use('/projects/:id', validateProjectId);

//GET, primeiro parametro é o endereço que queremos observar, segundo uma função que contem dois parametros, o request (requisição) 
//e o response (resposta)
//REQUEST guarda as informações da requisição que o usuário fez, como a rota, parâmetros

app.get('/projects'/**<-Recurso*/, (request, response) => {

  //Query params
  const { title } = request.query;

  const results = title //verifica se o title possui alguma info
    ? projects.filter(project => project.title.includes(title)) //filtra o vetor de projetos procurando por titulos que possuem a palavra determinada incluida
    : projects; // se não tiver retorna os projetos, caso não seja o titulo não possua uma info, se não retorna vazio

  // return response.send('Hello World');//SEND permite retornar um texto

  return response.json(results);//todo o retorno da rota precisa utilizar o response
});

//Criar um projeto
app.post('/projects', (request, response) => {

  //Request Body
  const { title, owner } = request.body;
  const project = { id: uuid(), title, owner }

  projects.push(project)

  return response.json(project)
})

//Utilizamos um indentificador unico, para modificar apenas um elemento
app.put('/projects/:id', (request, response) => {

  //Route params
  const { id } = request.params;
  const { title, owner } = request.body;

  const projectIndex = projects.findIndex(project => project.id == id); //procura o indice onde a verificação é true

  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found" })
  }//verifica se a variavel possui algum elemento, caso não apresenta a mensagem

  //criamos um nova informação do projeto
  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;//substitui o valor

  return response.json(project);//retornamos o projeto atualizado e não a lista toda
})

//Utilizamos um indentificador unico, para deletar apenas um elemento
app.delete('/projects/:id', (request, response) => {

  //Route params
  const { id } = request.params;

  const projectIndex = projects.findIndex(project => project.id == id); //procura o indice onde a verificação é true

  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found" })
  }

  projects.splice(projectIndex, 1); //Splice remove uma informação de dentro do array, passando o indice e quantas posições se quer remover a partir do indice 

  return response.status(204).send();
})

app.listen(3333, () => {
  console.log('Back-end started!📡');
});//definimos uma porta para rodar o back-end, além disso acrecentamos
//como segundo parametro uma função que sera chamada automaticamente
//assim que o servidor for iniciado, apresentando uma mensagem
