import ky from 'ky'

import { ArticleChaptersData, ChapterDownloadInfoData, ChapterInfoData, ReadAWriteAjaxResponse } from './types'

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
      title: chapterInfo.chapter_title.trim(),
      subtitle: chapterInfo.chapter_subtitle.trim(),
      firstPublishedAt: chapterInfo.first_published_date,
      createdAt: chapterInfo.create_date,
      updatedAt: chapterInfo.edit_date,
      siblings: {
        previous: chapterInfo.previous_chapter_guid
          ? {
              guid: chapterInfo.previous_chapter_guid.trim(),
              title: chapterInfo.previous_chapter_title.trim(),
            }
          : null,
        next: chapterInfo.next_chapter_guid
          ? {
              guid: chapterInfo.next_chapter_guid.trim(),
              title: chapterInfo.next_chapter_title.trim(),
            }
          : null,
      },
    },
  }
}
