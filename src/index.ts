import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https'
import pathToFfmpeg from 'ffmpeg-static';
import rimraf from 'rimraf';
import os from 'os'

function mediaBus(filePath: string, outPutType: 'mp3' | 'aud' | 'amr', needBuffer: boolean = true, outPutPath?: string) {
	
	return new Promise((resolve, reject) => {
		const _filePath = path.parse(filePath),
			ext = _filePath.ext,
			filename = _filePath.name;
		
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
		let cacheFolderPrefix = os.tmpdir() + '/media_bus_cache', cacheFolderOut = outPutPath
		// 临时文件夹作为交换空间
		const cacheFolder = fs.mkdtempSync(cacheFolderPrefix)
		if(!cacheFolderOut){
			cacheFolderOut = cacheFolder
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
						process.nextTick(()=>{
							rimraf(cacheFolder, (error)=>{
								if(error){
									console.error(error)
								}
							})
						})
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