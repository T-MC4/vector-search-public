import type { NextApiRequest, NextApiResponse } from 'next';
import { embedDocs } from '@/utils/customDocEmbedder';
// import { pinecone } from '@/utils/pinecone-client';
// import { allShortFillers } from '@/utils/fillers/shortFillers';
// import { allLongFillers } from '@/utils/fillers/longFillers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;
  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    // const index = pinecone.Index("short-filler-data")
    // const hrStart = process.hrtime();
    // console.time('Pinecone Timer');
    const vectorStore = await embedDocs('', false);

    const t0 = performance.now();

    const result = await vectorStore.pineconeIndex.query({
      queryRequest: {
        includeMetadata: true,
        namespace: '',
        topK: 1,
        vector: await vectorStore.embeddings.embedQuery(sanitizedQuestion),
      },
    });
    const results = result.matches;

    const t1 = performance.now();
    console.log(`This code took ${t1 - t0} milliseconds.`);

    // const result = await vectorStore.similaritySearch(sanitizedQuestion, 1);
    // console.timeEnd('Pinecone Timer');
    // const hrEnd = process.hrtime(hrStart);
    // console.info('Execution time (hr): %ds %dms', hrEnd[0], hrEnd[1] / 1000000);

    // Retrieve the Filler from local storage
    // let text = '';
    // let category = '';
    // let fillerID = 0;
    // for (let i of allShortFillers) {
    //   if (i.metadata.fillerID === results[0][0].metadata.fillerID) {
    //     text = i.pageContent;
    //     category = i.metadata.category;
    //     fillerID = i.metadata.fillerID;
    //   }
    // }
    const response = `${results[0].metadata.fillerText} (Category:${results[0].metadata.category} | ID:${results[0].metadata.fillerID} | TRAINING: ${results[0].pageContent})`;
    console.log(response);

    let history: any[] = [];
    for (let i of results) {
      let prospectStatement = i.pageContent;
      let content = i.metadata.fillerText;
      let id = i.metadata.fillerText;
      // for (let item of allShortFillers) {
      //   if (item.metadata.fillerID === i[0].metadata.fillerID) {
      //     content = item.pageContent;
      //     id = item.metadata.fillerID;
      //   }
      // }

      history.push({
        content: prospectStatement,
        filler: `(${id}) ${content}`,
      });
    }
    console.log(history);

    const data = { response: response, sourceDocs: history };

    res.status(200).json(data);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
