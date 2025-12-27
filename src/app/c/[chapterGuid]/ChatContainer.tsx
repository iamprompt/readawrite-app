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
  const [visibleCount, setVisibleCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isInit = useRef(false)

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
    setVisibleCount(0)
    setIsComplete(false)
    setIsAutoPlay(false)
  }

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev)
  }

  // Scroll to bottom when new message appears
  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true
      return
    }

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
    <div className="relative -mx-4 flex h-dvh flex-col" ref={chatContainerRef}>
      {/* Chat Messages */}
      <div className="no-scrollbar flex-1 scroll-pb-12 space-y-1 overflow-y-scroll rounded-t-lg bg-white px-8 py-4 dark:bg-gray-800">
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

        <div id="chat-end" ref={chatEndRef} />
      </div>

      {/* Bottom Control Bar - Matching Readawrite original layout */}
      <div className="sticky bottom-0 flex items-stretch rounded-b-lg border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {/* Left Section - Restart */}
        <button
          onClick={restart}
          className="flex w-20 shrink-0 items-center justify-center border-r border-gray-200 py-4 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title="เริ่มใหม่"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Center Section - Click to Read / Progress */}
        <button
          onClick={!isComplete ? advanceMessage : showAll}
          disabled={isComplete}
          className="flex flex-1 items-center justify-center py-4 text-base text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {!isComplete ? (
            <span>คลิกอ่าน</span>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">จบตอน</span>
          )}
        </button>

        {/* Right Section - Next / Auto-play */}
        <button
          onClick={!isComplete ? (isAutoPlay ? toggleAutoPlay : advanceMessage) : undefined}
          onDoubleClick={toggleAutoPlay}
          disabled={isComplete}
          className="flex w-20 shrink-0 items-center justify-center border-l border-gray-200 py-4 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:disabled:text-gray-600"
          title={isAutoPlay ? 'หยุดเล่นอัตโนมัติ' : 'ถัดไป (ดับเบิลคลิกเพื่อเล่นอัตโนมัติ)'}
        >
          {isAutoPlay ? (
            <svg className="h-5 w-5 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
