import { decode } from 'html-entities'
import ky from 'ky'
import md5 from 'md5'

import { getArticleContentDownloadInfo, getChapterContentDownloadInfo, getChapterInfo } from '../helpers'
import { ArticleContent } from '../types'
import { convertArrayBufferViewtoString, convertHexToString, convertStringToArrayBufferView } from './MebUtil'

const globalIV = convertStringToArrayBufferView(convertHexToString('7F9608BF748309A2C7DAA63600AB3825'))

const isZip = (header: Uint8Array) => {
  return header[0] === 80 && header[1] === 75 && header[2] === 3 && header[3] === 4
}

export const decrypt = async (
  keyString: string,
  encryptedData: ArrayBuffer,
  onSuccess: (result: any) => void,
  onError: (error: any) => void,
) => {
  const keyBuffer = convertStringToArrayBufferView(keyString)

  try {
    const importedKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, [
      'encrypt',
      'decrypt',
    ])

    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: globalIV }, importedKey, encryptedData)

    const inputBuffer = new Uint8Array(decryptedBuffer)

    if (isZip(inputBuffer)) {
      // Unzip and Return
    } else {
      const data = convertArrayBufferViewtoString(inputBuffer)
      onSuccess(data)
    }
  } catch (error) {
    onError(error)
  }
}

export const decryptContent = (
  optKey: string,
  userId: string,
  filename: string,
  articleGuid: string,
  chapterGuid: string,
  encryptedData: ArrayBuffer,
  onSuccess: (result: any) => void,
  onError: (error: any) => void,
) => {
  return decrypt(
    deriveContentKey(optKey, userId, filename, articleGuid, chapterGuid),
    encryptedData,
    onSuccess,
    onError,
  )
}

function rotateBits(value: number, amount: number, isLeftShift: boolean) {
  let binaryStr = value.toString(2).padStart(4, '0')
  for (let i = 0; i < amount; i++) {
    if (isLeftShift) {
      binaryStr = binaryStr.substr(1, 3) + binaryStr.substr(0, 1)
    } else {
      binaryStr = binaryStr.substr(3, 1) + binaryStr.substr(0, 3)
    }
  }

  binaryStr = binaryStr.replace(/[^01]/gi, '')

  return parseInt(binaryStr, 2)
}

export const deriveContentKey = (
  optKey: string,
  userId: string,
  filename: string,
  articleGuid: string,
  chapterGuid: string,
) => {
  const saltedHash = md5(userId + filename + articleGuid + chapterGuid)
  let finalKey = ''
  for (let i = 0; i < 32; i++) {
    const baseCharVal = parseInt(optKey[i], 16)
    const saltCharVal = parseInt(saltedHash[i], 16)
    const shiftAmount = Math.ceil(saltCharVal / 16)
    finalKey += rotateBits(baseCharVal, shiftAmount, true).toString(16)
  }
  return finalKey
}

export const loadChapterContent = async (chapterGuid: string) => {
  const chapterInfo = await getChapterInfo(chapterGuid)
  const chapterContentDownloadInfo = await getChapterContentDownloadInfo(chapterGuid)

  try {
    const response = await ky.get(chapterContentDownloadInfo.chapterPath)
    const arrayBuffer = await response.arrayBuffer()

    const fileName = chapterContentDownloadInfo.chapterPath.split(/[?#]/)[0].split('/').pop()

    const content = await new Promise<string>((resolve, reject) => {
      decryptContent(
        chapterContentDownloadInfo.optKey,
        '--MebFreeUser--',
        fileName || '',
        '',
        chapterInfo.chapter.guid,
        arrayBuffer,
        resolve,
        reject,
      )
    })

    let decodedContent = decode(content)

    decodedContent = decodedContent
      .replace(/.*<content>/i, '')
      .replace(/<\/content>.*/i, '')
      .replace(/<��ֻ���Y��Yn�]Kt>/g, '')

    return decodedContent
  } catch (error) {
    console.error('Error loading content file:', error)
    throw error
  }
}

export const loadArticleContent = async (articleGuid: string) => {
  const articleContentDownloadInfo = await getArticleContentDownloadInfo(articleGuid)

  try {
    const response = await ky.get(articleContentDownloadInfo.articlePath)
    const arrayBuffer = await response.arrayBuffer()

    const fileName = articleContentDownloadInfo.articlePath.split(/[?#]/)[0].split('/').pop()

    const content = await new Promise<string>((resolve, reject) => {
      decryptContent(
        articleContentDownloadInfo.optKey,
        '--MebFreeUser--',
        fileName || '',
        articleGuid,
        '',
        arrayBuffer,
        resolve,
        reject,
      )
    })

    let decodedContent = decode(content)

    decodedContent = decodedContent
      .replace(/.*<content>/i, '')
      .replace(/<\/content>.*/i, '')
      .replace(/<��â���Y��Yn�]Kt>/g, '')

    return JSON.parse(decodedContent) as ArticleContent
  } catch (error) {
    console.error('Error loading content file:', error)
    throw error
  }
}
