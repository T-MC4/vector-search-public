import weaviate, { ApiKey } from 'weaviate-ts-client';

if (!process.env.WEAVIATE_API_KEY) {
  throw new Error('Weaviate api key var missing');
}
// if (!process.env.COHERE_API_KEY) {
//   throw new Error('Cohere api key var missing');
// }
// if (!process.env.HUGGINGFACE_API_KEY) {
//   throw new Error('Huggingface api key var missing');
// }
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI api key var missing');
}

const weaviateClient = weaviate.client({
  scheme: 'https',
  // host: 'short-filler-data-ay7br9fq.weaviate.network',
  host: 'x63xnlagsggr2yemkqyc9a.gcp-a.weaviate.cloud', // Paid tier
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
  headers: {
    // 'X-Cohere-Api-Key': process.env.COHERE_API_KEY,
    // 'X-HuggingFace-Api-Key': process.env.HUGGINGFACE_API_KEY,
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
  },
});

const t0 = performance.now();
// OPENAI EMBEDDING
const arr = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'text-embedding-ada-002',
    input: 'test',
  }),
});

if (arr.status !== 200) {
  throw new Error('Failed to create embedding for question');
}

const {
  data: [{ embedding }],
} = await arr.json();
console.log(embedding);
// {concepts: ['my wife left me']}

// EMPTY EMBEDDING
// let embedding = new Array(1536).fill(0);

async function nearTextQuery() {
  const res = await weaviateClient.graphql
    .get()
    .withClassName('ShortFillers')
    .withFields(
      'pageContent fillerID fillerText category _additional{certainty distance}',
    )
    .withNearVector({ vector: embedding })
    .withLimit(1)
    .do();

  console.log(JSON.stringify(res, null, 2));
  return res;
}

await nearTextQuery();
const t1 = performance.now();
console.log(`This code took ${t1 - t0} milliseconds.`);

// DELETE CLASSES
// const classNames = [
// 'ShortFillers',
// 'ShortFillersOpenAlModel',
// 'ShortFillersOpenAlMode12',
// 'ShortFillersOpenAlModel3',
// 'ShortFillersOpenAlModelAttempt',
// ];

// classNames.forEach((className) => {
//   const schema = weaviateClient.schema.get(className);
//   console.log(schema);
// });

// classNames.forEach((className) => {
//   weaviateClient.schema.classDeleter().withClassName(className).do();
// .then((res) => {
//   console.log(res);
// })
// .catch((err) => {
//   console.error(err);
// });
// });
