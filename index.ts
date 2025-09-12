import { generateAudio } from "./src/audio/utils/generateAudio";
import { Readable } from "stream";
import fs from "fs";
import * as Minio from "minio";
import { sMinio } from "./src/audio/classes/Minio";

const minio = new sMinio();

//const audio = await generateAudio("huddle");