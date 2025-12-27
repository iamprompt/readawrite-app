import type { Metadata } from 'next'
import Link from 'next/link'

import { getArticleChapters, getChapterInfo } from '@/lib/readawrite/helpers'

type Props = {
  params: Promise<{ articleGuid: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { articleGuid } = await params
  const chapterData = await getArticleChapters(articleGuid)

  // Use first chapter to get article info
  if (chapterData.chapters.length > 0) {
    const firstChapter = chapterData.chapters[0]
    const chapterInfo = await getChapterInfo(firstChapter.guid)
    const { article } = chapterInfo

    const title = article.title
    const description = `${article.title} โดย ${article.publisher.name} - ${chapterData.total} ตอน`

    return {
      title,
      description,
      authors: [{ name: article.publisher.name }],
      keywords: article.tags,
      openGraph: {
        title,
        description,
        type: 'website',
        images: [{ url: article.thumbnail }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [article.thumbnail],
      },
    }
  }

  return {
    title: 'บทความ',
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const decodeHtmlEntities = (text: string) => {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => entities[match] || match)
}

const Page = async ({ params }: Props) => {
  const { articleGuid } = await params

  const chapterData = await getArticleChapters(articleGuid)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">ตอนทั้งหมด ({chapterData.total})</h1>
        </div>

        {/* Chapter List */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {chapterData.chapters.map((chapter, index) => (
            <Link
              key={chapter.guid}
              href={`/c/${chapter.guid}`}
              className="group block transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div
                className={`flex items-start gap-4 p-4 ${
                  index !== chapterData.chapters.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
              >
                {/* Chapter Number */}
                <div className="flex h-10 w-12 shrink-0 items-center justify-center">
                  <span className="text-lg font-bold text-teal-500">#{chapter.order}</span>
                </div>

                {/* Chapter Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-medium text-gray-900 group-hover:text-teal-600 dark:text-gray-100 dark:group-hover:text-teal-400">
                    {decodeHtmlEntities(chapter.title)}
                  </h2>
                  {chapter.subtitle && (
                    <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                      {decodeHtmlEntities(chapter.subtitle)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(chapter.firstPublishedAt || chapter.createdAt)}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex h-10 shrink-0 items-center text-gray-300 transition-colors group-hover:text-teal-500 dark:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {chapterData.chapters.length === 0 && (
            <div className="py-12 text-center text-gray-500">ยังไม่มีตอนในขณะนี้</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
