import { createWriteStream, write } from "fs";
import { extname } from "path";

export class UtilService {

    createUniqueFileName(file: Express.Multer.File) {
        const ext = extname(file.originalname);
        // get fileName
        const fileName = `${Math.ceil(Math.random() * 1e8 * Date.now())}${ext}`
        // get File path
        return fileName
    }

    writeFile(filePath: string, buf: Buffer) {
        const writeStream = createWriteStream(filePath);
        writeStream.write(buf)
        return;
    }
}