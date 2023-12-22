// Importa as bibliotecas brain.js e papaparse
const brain = require('brain.js');
const Papa = require('papaparse');

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
    inputSize: 20,
    inputRange: 20,
    hiddenLayers: [20, 20],
    activation: 'sigmoid',
    outputSize: 20,
    learningRate: 0.01,
    decayRate: 0.999,
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
net.train(trainingData, {
    log:(stats) => console.log(`Interations: ${stats.iterations}, Error: ${stats.error}`),
    logPeriod:10
  });

// Teste a rede neural executando-a com um conjunto de dados de entrada
const result = parseFloat(net.run({tempMin: 4, tempMax: 7,cloudCover: 0.99, humidity:0.99, windSpeed: 20, visibility: 7.2 }).rain).toFixed(3);


// Imprima o resultado da previsão da rede neural
console.log(`Com os dados inseridos, prevê-se que amanhã há a seguinte probabilidade de chuva: ${result}`);