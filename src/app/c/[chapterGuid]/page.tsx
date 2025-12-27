import type { Metadata } from 'next'
import Link from 'next/link'

import { getChapterContent, getChapterInfo } from '@/lib/readawrite/helpers'

import { ChatContainer } from './ChatContainer'

type Props = {
  params: Promise<{ chapterGuid: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { chapterGuid } = await params
  const chapterInfo = await getChapterInfo(chapterGuid)
  const { article, chapter } = chapterInfo

  const title = `${chapter.title} - ${article.title}`
  const description = chapter.subtitle || `ตอนที่ ${chapter.order} ของ ${article.title} โดย ${article.publisher.name}`

  return {
    title,
    description,
    authors: [{ name: article.publisher.name }],
    keywords: article.tags,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: article.thumbnail }],
      authors: [article.publisher.name],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [article.thumbnail],
    },
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

const Page = async ({ params }: Props) => {
  const { chapterGuid } = await params

  const chapterInfo = await getChapterInfo(chapterGuid)
  const chapterContent = await getChapterContent(chapterGuid)

  const { article, chapter } = chapterInfo

  console.log(JSON.stringify(chapterContent, null, 2))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/a/${article.guid}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับไปหน้าเรื่อง
        </Link>

        {/* Article Header */}
        <div className="mb-6 flex gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.thumbnail}
            alt={article.title}
            className="h-36 w-24 shrink-0 rounded-lg object-cover shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground">{article.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">โดย {article.publisher.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter Info Card */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-lg font-bold text-teal-500">#{chapter.order}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">จาก {article.chapterCount} ตอน</span>
          </div>

          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h2>
          {chapter.subtitle && <p className="mt-1 text-gray-500 dark:text-gray-400">{chapter.subtitle}</p>}
        </div>

        {/* Chapter Content */}
        <div className="mb-6">
          {/* HTML Content (contentType: 0) */}
          {'html' in chapterContent && chapterContent.html && (
            <div
              className="prose prose-lg dark:prose-invert max-w-none rounded-lg bg-white p-6 dark:bg-gray-800 [&_.AlignCenter]:text-center [&_.AlignCenter]:indent-0 [&_.AlignRight]:text-right [&_img]:mx-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-5 [&_p]:indent-4 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-gray-800 dark:[&_p]:text-gray-200"
              dangerouslySetInnerHTML={{ __html: chapterContent.html }}
            />
          )}

          {/* Chat Content (contentType: 2) */}
          {'content' in chapterContent && chapterContent.content && <ChatContainer content={chapterContent.content} />}

          {/* Chapter Metadata */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
            <div>
              <span className="text-gray-500 dark:text-gray-400">เผยแพร่:</span> {formatDate(chapter.firstPublishedAt)}
            </div>
            {chapter.updatedAt !== chapter.firstPublishedAt && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">แก้ไขล่าสุด:</span> {formatDate(chapter.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">แท็ก</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Navigation */}
        <div className="grid grid-cols-2 gap-4">
          {chapter.siblings.previous ? (
            <Link
              href={`/c/${chapter.siblings.previous.guid}`}
              className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
            >
              <span className="text-sm text-gray-400 group-hover:text-teal-500 dark:text-gray-500">← ตอนก่อนหน้า</span>
              <p className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {chapter.siblings.previous.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {chapter.siblings.next ? (
            <Link
              href={`/c/${chapter.siblings.next.guid}`}
              className="group rounded-lg border border-gray-200 bg-white p-4 text-right transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
            >
              <span className="text-sm text-gray-400 group-hover:text-teal-500 dark:text-gray-500">ตอนถัดไป →</span>
              <p className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {chapter.siblings.next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
