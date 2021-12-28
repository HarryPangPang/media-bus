# media-bus

用于各种媒体文件的格式转换

目前支持：amr格式的音频文件转mp3

# install

```
npm i media-bus --save
```

# config
filePath: 源文件地址/链接： string
outPutType: 输出文件格式：'mp3' | 'aud' | 'amr'
needBuffer: 是否返回buffer：boolean = true,
outPutPath?: 文件输出地址：string

# useage

## cjs
```

const mediaBus = require('media-bus')
const fs = require('fs')
mediaBus('path to mamr or http address' , 'mp3' )
  .then(function (data) {
	fs.writeFileSync('./a.mp3', data)
  })
  .catch(function (err) {
    console.log(err)
  })

```

## esm
```
import  mediaBus from 'media-bus';
import fs from 'fs';
const fs = require('fs')
mediaBus('path to mamr or http address' , 'mp3' )
  .then(function (data) {
	fs.writeFileSync('./a.mp3', data)
  })
  .catch(function (err) {
    console.log(err)
  })

```

