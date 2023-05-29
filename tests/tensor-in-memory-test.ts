import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
// import * as tf from '@tensorflow/tfjs-node';

const modelUrl =
  'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
const model = await tf.loadGraphModel(modelUrl);
const zeros = tf.zeros([1, 224, 224, 3]);
model.predict(zeros).print();

// Load the model.
use.loadQnA().then((model) => {
  // Embed a dictionary of a query and responses. The input to the embed method
  // needs to be in following format:
  // {
  //   queries: string[];
  //   responses: Response[];
  // }
  // queries is an array of question strings
  // responses is an array of following structure:
  // {
  //   response: string;
  //   context?: string;
  // }
  // context is optional, it provides the context string of the answer.

  const input = {
    queries: ['How are you feeling today?', 'What is the captial of China?'],
    responses: [
      "I'm not feeling very well.",
      'Beijing is the capital of China.',
      'You have five fingers on your hand.',
    ],
  };
  var scores = [];
  const embeddings = model.embed(input);
  /*
   * The output of the embed method is an object with two keys:
   * {
   *   queryEmbedding: tf.Tensor;
   *   responseEmbedding: tf.Tensor;
   * }
   * queryEmbedding is a tensor containing embeddings for all queries.
   * responseEmbedding is a tensor containing embeddings for all answers.
   * You can call `arraySync()` to retrieve the values of the tensor.
   * In this example, embed_query[0] is the embedding for the query
   * 'How are you feeling today?'
   * And embed_responses[0] is the embedding for the answer
   * 'I\'m not feeling very well.'
   */
  const embed_query = embeddings['queryEmbedding'].arraySync();
  const embed_responses = embeddings['responseEmbedding'].arraySync(); // compute the dotProduct of each query and response pair.
  for (let i = 0; i < input['queries'].length; i++) {
    for (let j = 0; j < input['responses'].length; j++) {
      scores.push(dotProduct(embed_query[i], embed_responses[j]));
    }
  }
  console.log(scores);
});

// Calculate the dot product of two vector arrays.
const dotProduct = (xs, ys) => {
  const sum = (xs) => (xs ? xs.reduce((a, b) => a + b, 0) : undefined);

  return xs.length === ys.length
    ? sum(zipWith((a, b) => a * b, xs, ys))
    : undefined;
};

// zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
const zipWith = (f, xs, ys) => {
  const ny = ys.length;
  return (xs.length <= ny ? xs : xs.slice(0, ny)).map((x, i) => f(x, ys[i]));
};

// ----------------------------------

// import * as hub from 'tensorflow_hub'

// const model = hub.KerasLayer("https://tfhub.dev/google/nnlm-en-dim128/2")
// const embeddings = model(["The rain in Spain.", "falls",
//                     "mainly", "In the plain!"])

// console.log(embeddings.shape)  //(4,128)

// const model = await tf.loadLayersModel('https://path/to/your/model.json');

// const input = tf.tensor2d('[your input data]');
// const predictions = model.predict(input);
