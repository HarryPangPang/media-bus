import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https'
import pathToFfmpeg from 'ffmpeg-static';

function mediaBus(filePath: string, outPutType: 'mp3' | 'aud' | 'amr', needBuffer: boolean = true, outPutPath?: string) {
	const cacheFolderOut = outPutPath || './.media_bus_cache/out'
	const cacheFolder = path.resolve('./.media_bus_cache');
	return new Promise((resolve, reject) => {
		const _filePath = path.parse(filePath),
			ext = _filePath.ext,
			filename = _filePath.name;
		const cacheFolderExist = fs.existsSync(cacheFolder)
		let dest: string
		let filePathCopy = filePath
		if (!ext) {
			reject(new Error('Come on girl,File type is not support!'))
		}
		if (!filename) {
			reject(new Error('File need a name, Dude'))
		}
		if (!outPutType) {
			reject(new Error('Hey! You forgot the file type!'))
		}
		// 临时文件夹作为交换空间
		if (!cacheFolderExist) {
			fs.mkdirSync(cacheFolder)
		}
		const cacheFolderOutExist = fs.existsSync(path.resolve(cacheFolderOut))
		if (!outPutPath && !cacheFolderOutExist) {
			fs.mkdirSync(path.resolve(cacheFolderOut))
		}
		
		dest = path.join(cacheFolder, filename + ext)
		
		let file = fs.createWriteStream(dest)
		if (filePath.indexOf('http://') === 0) {

			http.get(filePath, (response) => {
				response.pipe(file);
				file.on('finish', function () {
					file.close();
					filePathCopy = dest
				});
			}).on('error', (err) => {
				fs.unlink(dest, err2 => {
					reject(err2)
				});
				reject(err)
			})
		}
		if (filePath.indexOf('https://') === 0) {
			https.get(filePath, (response) => {
				response.pipe(file);
				file.on('finish', function () {
					file.close();
					filePathCopy = dest
				});
			}).on('error', (err) => {
				fs.unlink(dest, err2 => {
					reject(err2)
				});
				reject(err)
			})
		}
		const outPut = path.resolve(cacheFolderOut + '/' + filename + '.' + outPutType);
		var cmdStr = pathToFfmpeg + ' -y -i "' + path.normalize(filePathCopy) + '" -acodec libmp3lame -ar 24000 -vol 500 -ab 128 "' + outPut + '"';
		exec(cmdStr, (error: Error, _, stderr) => {
			if (error) {
				reject(new Error('error:' + stderr));
			} else {
				if (needBuffer) {
					const file = fs.readFileSync(outPut)
					if(!outPutPath){
						exec('rm -rf ./.media_bus_cache')
					}
					resolve(Buffer.from(file.buffer))
				} else {
					resolve(outPut);
				}
			}
		})
	})
}

export default mediaBus