import { decode } from 'html-entities'
import ky from 'ky'

import {
  ArticleChaptersData,
  ArticleContentDownloadInfoData,
  ChapterChatContent,
  ChapterDownloadInfoData,
  ChapterInfoData,
  ReadAWriteAjaxResponse,
} from './types'
import { loadArticleContent, loadChapterContent } from './utils/MebCrypto'

const requestArticleAjax = <T>(articleGuid: string, payload: Record<string, string | number | boolean>) => {
  return ky.post<T>(`https://www.readawrite.com/a/${articleGuid}?action=ajax&ajax=1&ajax_case=CallWrapper`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(payload).reduce(
        (acc, [key, value]) => {
          acc[key] = value.toString()
          return acc
        },
        {} as Record<string, string>,
      ),
    ),
  })
}

const requestChapterAjax = <T>(chapterGuid: string, payload: Record<string, string | number | boolean>) => {
  return ky.post<T>(`https://www.readawrite.com/c/${chapterGuid}?action=ajax&ajax=1&ajax_case=CallWrapper`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(payload).reduce(
        (acc, [key, value]) => {
          acc[key] = value.toString()
          return acc
        },
        {} as Record<string, string>,
      ),
    ),
  })
}

export const getArticleChapters = async (articleGuid: string) => {
  const response = await requestArticleAjax<ReadAWriteAjaxResponse<ArticleChaptersData>>(articleGuid, {
    api_call: 'Article',
    method_call: 'userGetChapterListWithRange',
    article_guid: articleGuid,
    sort_type: 'asc',
    // start_range: 0,
    // end_range: 0,
    get_comingsoon_chapter: 1,
  })

  const data = await response.json()

  const { data: articleChapters } = data

  return {
    total: articleChapters.total_count,
    chapters: articleChapters.chapter_list.map((chapter) => ({
      guid: chapter.chapter_guid.trim(),
      order: chapter.chapter_order,
      title: chapter.chapter_title.trim(),
      subtitle: chapter.chapter_subtitle.trim(),
      firstPublishedAt: chapter.first_published_date,
      createdAt: chapter.create_date,
      updatedAt: chapter.edit_date,
    })),
  }
}

export const getChapterContentDownloadInfo = async (chapterGuid: string) => {
  const response = await requestChapterAjax<ReadAWriteAjaxResponse<ChapterDownloadInfoData>>(chapterGuid, {
    api_call: 'My',
    method_call: 'userStartDownloadChapter',
    chapter_guid: chapterGuid,
    app_id: 'RAW',
    app_platform: 'WEB',
  })

  const data = await response.json()

  const { data: chapterInfo } = data

  return {
    optKey: chapterInfo.opt_key,
    chapterPath: `${chapterInfo.chapter_path}${chapterInfo.chapter_order.toString().padStart(7, '0')}.raw?web${chapterInfo.chapter_edition}`,
  }
}

export const getArticleContentDownloadInfo = async (articleGuid: string) => {
  const response = await requestArticleAjax<ReadAWriteAjaxResponse<ArticleContentDownloadInfoData>>(articleGuid, {
    api_call: 'My',
    method_call: 'userStartDownloadArticleContents',
    article_guid: articleGuid,
    app_id: 'RAW',
    app_platform: 'WEB',
  })

  const data = await response.json()

  const { data: articleInfo } = data

  return {
    optKey: articleInfo.opt_key,
    articlePath: `${articleInfo.article_path}articlecontents.raw?web${articleInfo.article_edition}`,
  }
}

export const getChapterInfo = async (chapterGuid: string) => {
  const response = await requestChapterAjax<ReadAWriteAjaxResponse<ChapterInfoData>>(chapterGuid, {
    api_call: 'Article',
    method_call: 'userGetChapterInfo',
    chapter_guid: chapterGuid,
    app_id: 'RAW',
    app_platform: 'WEB',
  })

  const data = await response.json()

  const { data: chapterInfo } = data

  return {
    article: {
      guid: chapterInfo.article_guid.trim(),
      title: chapterInfo.article_name.trim(),
      type: chapterInfo.article_type,
      thumbnail: `${chapterInfo.article_thumbnail_path}large.gif`,
      species: chapterInfo.article_species,
      chapterCount: chapterInfo.chapter_count,
      publisher: {
        name: chapterInfo.publisher_name,
      },
      categories: [chapterInfo.category_name, chapterInfo.category_name_2].filter(Boolean),
      tags: chapterInfo.tag_list.map((tag) => tag.tag_name),
    },
    chapter: {
      guid: chapterInfo.chapter_guid.trim(),
      order: chapterInfo.chapter_order,
      title: decode(chapterInfo.chapter_title.trim()),
      subtitle: decode(chapterInfo.chapter_subtitle.trim()),
      contentType: chapterInfo.content_type,
      firstPublishedAt: chapterInfo.first_published_date,
      createdAt: chapterInfo.create_date,
      updatedAt: chapterInfo.edit_date,
      siblings: {
        previous: chapterInfo.previous_chapter_guid
          ? {
              guid: chapterInfo.previous_chapter_guid.trim(),
              title: decode(chapterInfo.previous_chapter_title.trim()),
            }
          : null,
        next: chapterInfo.next_chapter_guid
          ? {
              guid: chapterInfo.next_chapter_guid.trim(),
              title: decode(chapterInfo.next_chapter_title.trim()),
            }
          : null,
      },
    },
  }
}

export const getChapterContent = async (chapterGuid: string) => {
  const chapterInfo = await getChapterInfo(chapterGuid)

  try {
    const content = await loadChapterContent(chapterGuid)

    switch (chapterInfo.chapter.contentType) {
      case 0:
        return {
          type: chapterInfo.chapter.contentType,
          html: content,
        }
      case 2: {
        const articleContent = await getArticleContent(chapterInfo.article.guid)

        const chapterContent = JSON.parse(content) as ChapterChatContent

        Object.assign(chapterContent.character_list, articleContent.character_list)

        return {
          type: chapterInfo.chapter.contentType,
          content: chapterContent,
        }
      }
      default:
        throw new Error('Invalid content type')
    }
  } catch (error) {
    console.error('Error loading content file:', error)
    throw error
  }
}

export const getArticleContent = async (articleGuid: string) => {
  try {
    const content = await loadArticleContent(articleGuid)
    return content
  } catch (error) {
    console.error('Error loading content file:', error)
    throw error
  }
}
