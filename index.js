const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const brain = require('brain.js');
const Papa = require('papaparse');
const cors = require('cors');
app.use(cors());

// Importa a biblioteca fs (sistema de arquivos)
const fs = require('fs');

// Lê o conteúdo do arquivo 'clean_weather_data.csv' e armazena-o em uma variável chamada 'data'
const data = fs.readFileSync('clean_weather_data.csv', 'utf-8');

// Parseie os dados CSV em 'data' usando o papaparse e armazene-os como um array JSON
const jsonArray = Papa.parse(data, {
    header: true, // use a primeira linha como cabeçalho
    dynamicTyping: true, // converta valores de string para seus tipos de dados apropriados
  }).data;

// Define a configuração para a rede neural
const config = {
    inputSize: 6,
    inputRange: 6,
    hiddenLayers: [20, 20],
    activation: 'sigmoid',
    outputSize: 2,
    learningRate: 0.7,
    decayRate: 0.3,
};

// Cria uma nova rede neural usando a configuração
const net = new brain.NeuralNetwork(config);

let count = 0;

// Transforma o array JSON em um array de objetos que podem ser usados para treinar a rede neural
const trainingData = jsonArray.map(item =>{console.log(`A ler um registo nº ${count++} `); return({
    input:{tempMin: item.tempMin,
            tempMax: item.tempMax,
            cloudCover: item.cloudCover,
            humidity: item.humidity,
            windSpeed: item.windSpeed,
            visibility: item.visibility},
    output:{rain: item.desc}
})})

// Treina a rede neural usando os dados de treino
console.log('A treinar, por favor aguarde... ')
const stats = net.train(trainingData, {
  log:(stats) => console.log(`Interations: ${stats.iterations}, Error: ${stats.error}`),
  logPeriod:10
});



app.use(bodyParser.json());

// Next, define a route that accepts POST requests with JSON payloads:

app.post('/predict', (req, res) => {
  let message
  // Extract the input values from the request body
  const { tempMin, tempMax, cloudCover, humidity, windSpeed, visibility } = req.body;

  // Use your AI model to predict the output value
  const result = net.run({ tempMin, tempMax, cloudCover, humidity, windSpeed, visibility });

  switch (result) {
    case result< 0.25:
        message= "Probabilidade de precipitação reduzida"
        break;
    case result< 0.50:
        message= "Pouca probabilidade de precipitação"
        break;
    case result< 0.75:
        message= "Probabilidade de precipitação"
        break;
    case result<= 1:
        message= "Grande Probabilidade de precipitação"
        break;
    default:
      break;
  }


  // Send the prediction back to the client
  res.send({ prediction: result.rain, message: message, errorRate: stats.error, iterations: stats.iterations });
});

// Finally, start the server:

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
