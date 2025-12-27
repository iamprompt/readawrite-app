'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ChapterChatContent,
  ChapterChatContentCharacterList,
  ChapterChatContentConversationList,
} from '@/lib/readawrite/types'

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
        {conversation.gif && conversation.gif.urlString && (
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

// Interactive Chat Container with Click-to-Advance
export const ChatContainer = ({ content }: { content: ChapterChatContent }) => {
  const [visibleCount, setVisibleCount] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const characterMap = new Map(content.character_list.map((char) => [char.id, char]))
  const totalMessages = content.conversation_list.length

  // Pre-compute visibility flags
  const conversationsWithMeta = content.conversation_list.map((conversation, index) => {
    const prevConversation = index > 0 ? content.conversation_list[index - 1] : null
    const isNewCharacter = !prevConversation || conversation.character_id !== prevConversation.character_id
    const showAvatar = isNewCharacter
    const showName = isNewCharacter && conversation.type !== 'system' && conversation.type !== 'status'

    return { conversation, isNewCharacter, showAvatar, showName }
  })

  // Advance to next message
  const advanceMessage = useCallback(() => {
    if (visibleCount < totalMessages) {
      setVisibleCount((prev) => prev + 1)
    } else {
      setIsComplete(true)
      setIsAutoPlay(false)
    }
  }, [visibleCount, totalMessages])

  // Show all messages
  const showAll = () => {
    setVisibleCount(totalMessages)
    setIsComplete(true)
    setIsAutoPlay(false)
  }

  // Restart reading
  const restart = () => {
    setVisibleCount(1)
    setIsComplete(false)
    setIsAutoPlay(false)
  }

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev)
  }

  // Scroll to bottom when new message appears
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount])

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlay && !isComplete) {
      autoPlayIntervalRef.current = setInterval(advanceMessage, 1500)
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
        autoPlayIntervalRef.current = null
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [isAutoPlay, isComplete, advanceMessage])

  return (
    <div className="relative">
      {/* Chat Messages */}
      <div className="min-h-[300px] space-y-1 rounded-lg bg-white p-4 pb-20 dark:bg-gray-800">
        {conversationsWithMeta
          .slice(0, visibleCount)
          .map(({ conversation, isNewCharacter, showAvatar, showName }, index) => {
            const character = characterMap.get(conversation.character_id)

            return (
              <div
                key={conversation.conversation_id || index}
                className={`${isNewCharacter ? 'mt-3' : 'mt-1'} animate-fade-in`}
              >
                <ChatBubble
                  conversation={conversation}
                  character={character}
                  showAvatar={showAvatar}
                  showName={showName}
                />
              </div>
            )
          })}

        {/* End of chapter message */}
        {isComplete && content.message_end_of_chapter && (
          <div className="animate-fade-in mt-6 flex justify-center">
            <div className="rounded-xl bg-gray-800/60 px-4 py-2 text-sm text-white">
              {content.message_end_of_chapter}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Control Bar */}
      <div className="sticky right-0 bottom-0 left-0 flex items-center justify-between gap-4 rounded-b-lg border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
        {/* Progress */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {visibleCount} / {totalMessages}
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {!isComplete ? (
            <>
              {/* Click to Read Button */}
              <button
                onClick={advanceMessage}
                className="rounded-full bg-teal-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600 active:bg-teal-700"
              >
                คลิกอ่าน
              </button>

              {/* Auto-play Toggle */}
              <button
                onClick={toggleAutoPlay}
                className={`rounded-full p-2 transition-colors ${
                  isAutoPlay
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
                title={isAutoPlay ? 'หยุด' : 'เล่นอัตโนมัติ'}
              >
                {isAutoPlay ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={restart}
              className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            >
              เริ่มอ่านใหม่
            </button>
          )}
        </div>

        {/* Show All Button */}
        {!isComplete && (
          <button
            onClick={showAll}
            className="text-sm text-gray-500 transition-colors hover:text-teal-600 dark:text-gray-400"
          >
            ดูทั้งหมด
          </button>
        )}

        {isComplete && <div className="w-16" />}
      </div>
    </div>
  )
}
