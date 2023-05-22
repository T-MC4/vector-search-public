import { embedDocs } from '@/utils/customDocEmbedder';
import {
  getFilesInDirectory,
  readFileContent,
} from '@/utils/customTextAndJSONLoaders';
import path from 'path';
import fs from 'fs/promises';
import { turnIdIntoText, fillerObject } from '@/utils/scriptFunctions';

export const createVectorStore = async (labelType: string) => {
  console.time('Upsert Vectors');
  try {
    //Load the unsupervised Dataset of filler-labeled Prospect responses
    const arrayOfJSONFiles = await getFilesInDirectory(
      './docs/filler-labeled-JSONs/to_process',
      'json',
    );

    // upsert each JSON file into pinecone
    arrayOfJSONFiles.forEach(async (fileName: string) => {
      try {
        // get the file name
        const filePath = path.join(
          './docs/filler-labeled-JSONs/to_process',
          fileName,
        );
        // load the file's contents
        const content = await readFileContent(filePath);
        // turn the string into json
        const jsonContent = await JSON.parse(content);

        // Parse the jsonContent and replace every fillerID with the actual filler text
        if (labelType === 'filler-labels') {
          const contentWithFillerText = jsonContent;
          // const contentWithFillerText = jsonContent.map(
          //   (obj: fillerObject) => ({
          //     pageContent: obj.pageContent,
          //     metadata: {
          //       fillerID: obj.metadata.fillerID,
          //       fillerText: turnIdIntoText(obj),
          //       category: obj.metadata.category,
          //     },
          //   }),
          // );
          // console.log(
          //   'fillerJSON with fillerText property created successfully',
          // );

          // save json with fillerText
          await fs.writeFile(
            path.join('./docs/filler-labeled-JSONs/with_fillerText', fileName),
            JSON.stringify(contentWithFillerText),
          );
          console.log('fillerJSON with fillerText property saved successfully');

          // upsert to pinecone
          await embedDocs('', true, contentWithFillerText);
          console.log('fillerJSON w/ fillerText upserted successfully');

          // Move original file
          const parsedFileName = path.parse(fileName).name;
          const destPath = path.join(
            './docs/filler-labeled-JSONs/already_processed',
            `${parsedFileName}.json`,
          );
          await fs.rename(
            `./docs/filler-labeled-JSONs/to_process/${parsedFileName}.json`,
            destPath,
          );
          console.log('fillerJSON, w/o fillerText, moved successfully');
        } else if (labelType === 'cutoff-labels') {
          // upsert to pinecone
          await embedDocs('', true, jsonContent);
          console.log('labeledCutoffJSON upserted successfully');

          // Move original file
          const parsedFileName = path.parse(fileName).name;
          const destPath = path.join(
            './docs/filler-labeled-JSONs/already_processed',
            `${parsedFileName}.json`,
          );
          await fs.rename(
            `./docs/filler-labeled-JSONs/to_process/${parsedFileName}.json`,
            destPath,
          );
          console.log('labeledCutoffJSON moved successfully');
        }
      } catch (error) {
        console.log('This labeledJSON encountered an issue:', error);
      }
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
  console.timeEnd('Upsert Vectors');
};
