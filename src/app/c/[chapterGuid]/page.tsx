import Link from 'next/link'

import { getChapterContent, getChapterInfo } from '@/lib/readawrite/helpers'
import type {
  ChapterChatContent,
  ChapterChatContentCharacterList,
  ChapterChatContentConversationList,
} from '@/lib/readawrite/types'

type Props = {
  params: Promise<{ chapterGuid: string }>
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

// Chat Bubble Component
const ChatBubble = ({
  conversation,
  character,
  showAvatar,
  showName,
}: {
  conversation: ChapterChatContentConversationList
  character: ChapterChatContentCharacterList | undefined
  showAvatar: boolean
  showName: boolean
}) => {
  const isRight = conversation.position === 'right'
  const isMiddle = conversation.position === 'middle'
  const isSystem = conversation.type === 'system' || conversation.type === 'status'

  // System/Status message (centered)
  if (isSystem) {
    return (
      <div className="my-3 flex justify-center">
        <div className="rounded-xl bg-gray-800/60 px-4 py-2 text-sm whitespace-pre-line text-white">
          {conversation.message}
        </div>
      </div>
    )
  }

  // Middle position (centered with character info)
  if (isMiddle) {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Character name */}
        {showName && character && <span className="text-xs text-gray-500">{character.name}</span>}
        {/* Message bubble */}
        {conversation.message && (
          <div className="max-w-[75%] rounded-2xl bg-gray-200 px-3 py-2 text-base whitespace-pre-line text-gray-900 dark:bg-gray-600 dark:text-gray-100">
            {conversation.message}
          </div>
        )}
        {/* Image message */}
        {(conversation.img_path_1x || conversation.img_path_2x) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={conversation.img_path_2x || conversation.img_path_1x}
            alt="Message image"
            className="max-w-full rounded-lg"
            style={{
              maxHeight: conversation.height_img ? `${conversation.height_img}px` : '300px',
            }}
          />
        )}
      </div>
    )
  }

  // Regular chat message (left/right)
  return (
    <div className={`flex gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-10 shrink-0">
        {showAvatar && character && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.img_path_2x || character.img_path_1x}
            alt={character.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        )}
      </div>

      {/* Message content */}
      <div className={`max-w-[75%] ${isRight ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Character name */}
        {showName && character && (
          <span className={`mb-1 text-xs text-gray-500 ${isRight ? 'text-right' : 'text-left'}`}>{character.name}</span>
        )}

        {/* Message bubble */}
        {conversation.message && (
          <div
            className={`rounded-2xl px-3 py-2 text-base whitespace-pre-line ${
              isRight ? 'bg-green-300 text-gray-900' : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100'
            }`}
          >
            {conversation.message}
          </div>
        )}

        {/* Image message */}
        {(conversation.img_path_1x || conversation.img_path_2x) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={conversation.img_path_2x || conversation.img_path_1x}
            alt="Message image"
            className="max-w-full rounded-lg"
            style={{
              maxHeight: conversation.height_img ? `${conversation.height_img}px` : '300px',
            }}
          />
        )}

        {/* GIF message */}
        {conversation.gif && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={conversation.gif.urlString}
            alt="GIF"
            className="max-w-full rounded-lg"
            style={{
              maxWidth: conversation.gif.dims?.[0] ? `${conversation.gif.dims[0]}px` : '200px',
            }}
          />
        )}

        {/* Voice message */}
        {conversation.voice && (
          <div
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
              isRight ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
            </svg>
            <span className="text-sm text-gray-600">{conversation.voice.time}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Chat Container Component
const ChatContainer = ({ content }: { content: ChapterChatContent }) => {
  const characterMap = new Map(content.character_list.map((char) => [char.id, char]))

  // Pre-compute visibility flags to avoid variable reassignment during render
  const conversationsWithMeta = content.conversation_list.map((conversation, index) => {
    const prevConversation = index > 0 ? content.conversation_list[index - 1] : null
    const isNewCharacter = !prevConversation || conversation.character_id !== prevConversation.character_id
    const showAvatar = isNewCharacter
    const showName = isNewCharacter && conversation.type !== 'system' && conversation.type !== 'status'

    return { conversation, isNewCharacter, showAvatar, showName }
  })

  return (
    <div className="space-y-1 rounded-lg bg-white p-4 dark:bg-gray-800">
      {conversationsWithMeta.map(({ conversation, isNewCharacter, showAvatar, showName }, index) => {
        const character = characterMap.get(conversation.character_id)

        return (
          <div key={conversation.conversation_id || index} className={isNewCharacter ? 'mt-3' : 'mt-1'}>
            <ChatBubble conversation={conversation} character={character} showAvatar={showAvatar} showName={showName} />
          </div>
        )
      })}

      {/* End of chapter message */}
      {content.message_end_of_chapter && (
        <div className="mt-6 flex justify-center">
          <div className="rounded-xl bg-gray-800/60 px-4 py-2 text-sm text-white">{content.message_end_of_chapter}</div>
        </div>
      )}
    </div>
  )
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
