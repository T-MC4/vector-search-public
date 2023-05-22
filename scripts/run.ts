import { createTranscripts } from './create-transcripts';
import { createSingleSpeaker } from './create-single-speaker-data';
import { createLabeledData } from './create-labeled-data';
import { createVectorStore } from './ingest-data-to-pinecone';

export const run = async () => {
  try {
    try {
      // await createTranscripts();
    } catch (error) {
      console.log('Error during createTranscripts:', error);
      throw Error('Failed to complete createTranscripts');
    }
    try {
      // await createSingleSpeaker();
    } catch (error) {
      console.log('Error during createSingleSpeaker:', error);
      throw Error('Failed to complete createSingleSpeaker');
    }
    try {
      // await createLabeledData('endpoint-labels'); // Make sure to choose the right labeling option
    } catch (error) {
      console.log('Error during createLabeledData:', error);
      throw Error('Failed to complete createLabeledData');
    }
    try {
      await createVectorStore('filler-labels');
      // await createVectorStore('cutoff-labels');
    } catch (error) {
      console.log('Error during createVectorStore:', error);
      throw Error('Failed to complete createVectorStore');
    }
  } catch (error) {
    console.log('error', error);
    throw Error('Failed to complete workflow');
  }
};

(async () => {
  console.time(
    'Transcribing, Removing Speaker, Labeling, and Upserting Workflow Runtime',
  );
  // await test('test.json');
  await run();
  console.log('Worflow complete');
  console.timeEnd(
    'Transcribing, Removing Speaker, Labeling, and Upserting Workflow Runtime',
  );
})();

// import { turnIdIntoText, fillerObject } from '@/utils/scriptFunctions';
// import { readFileContent } from '@/utils/customTextAndJSONLoaders';
// import path from 'path';
// import fs from 'fs/promises';

// const test = async (fileName: string) => {
//   const filePath = path.join(
//     './docs/filler-labeled-JSONs/to_process',
//     fileName,
//   );
//   // load the file's contents
//   const content = await readFileContent(filePath);
//   // turn the string into json
//   const jsonContent = await JSON.parse(content);
//   // Parse the jsonContent and replace every fillerID with the actual filler text
//   var contentWithFillerText = jsonContent.map((obj: fillerObject) => ({
//     pageContent: obj.pageContent,
//     metadata: {
//       fillerID: turnIdIntoText(obj),
//       category: obj.metadata.category,
//     },
//   }));

//   // Save the new file
//   const destPath = path.join('./docs/filler-labeled-JSONs/test', fileName);
//   await fs.writeFile(destPath, JSON.stringify(contentWithFillerText));

//   // Move original file
//   await fs.rename(
//     `./docs/filler-labeled-JSONs/to_process/${parsedFileName}.json`,
//     destPath,
//   );
//   console.log('fillerJSON moved successfully');
// };
