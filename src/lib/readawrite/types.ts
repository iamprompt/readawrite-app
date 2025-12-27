export type ReadAWriteAjaxResponse<T extends Record<string, any>> = {
  status: Status
  data: T
}

export type Status = {
  success: boolean
  message: string
  code: number
  description: string
  version: string
}

export type ChapterDownloadInfoData = {
  opt_key: string
  chapter_path: string
  article_thumbnail_path: string
  article_name: string
  article_guid: string
  chapter_title: string
  chapter_subtitle: string
  chapter_order: number
  author_name: string
  author_guid: string
  user_id_publisher: number
  publisher_name: string
  category_id: number
  category_name: string
  view_count: number
  comment_count: number
  create_date: string
  edit_date: string
  server_datetime: string
  chapter_edition: number
  thumbnail_edition: number
  disable_word_transform_for_blind: number
  content_version: number
  censor_words: number
}

export type ArticleContentDownloadInfoData = {
  opt_key: string
  article_path: string
  article_thumbnail_path: string
  article_name: string
  article_guid: string
  author_name: string
  author_guid: string
  user_id_publisher: number
  publisher_name: string
  category_id: number
  category_name: string
  create_date: string
  edit_date: string
  server_datetime: string
  article_edition: number
  thumbnail_edition: number
  censor_words_content: number
  disable_word_transform_for_blind: number
}

export type ArticleChaptersData = {
  total_count: number
  count: number
  chapter_list: ChapterList[]
}

export type ChapterList = {
  chapter_guid: string
  chapter_title: string
  chapter_subtitle: string
  chapter_order: number
  content_type: number
  status: number
  status_text: string
  first_published_date: string
  create_date: string
  comment_count: number
  view_count: number
  baht_price: string
  flexible_pricing_enable: number
  flexible_pricing_description: any
  chapter_edition: number
  chapter_thumbnail_edition: number
  chapter_content_thumbnail_edition: number
  unpromoted_cover_image: any
  censor_words: number
  release_datetime: any
  is_released?: number
  is_show_release_time?: number
  campaign_id_list: any
  schedule_pricing_enable: number
  schedule_pricing_start_datetime: any
  schedule_baht_price: any
  schedule_pricing_end_datetime: any
  schedule_original_baht_price: any
  unpublish_datetime: any
  to_status: any
  is_unpublished: any
  edit_date: string
  word_count: number
  image_count: number
  bubble_count: number
  word_count_chat: number
  chapter_thumbnail_path: any
}

export type ChapterInfoData = {
  article_name: string
  article_guid: string
  article_chapter_id: number
  article_type: string
  article_type_text: string
  description: any
  content_type: number
  content_edit_date: string
  display_style: number
  is_single_cover: number
  article_content_thumbnail_edition: number
  author_name: string
  author_guid: string
  user_id_publisher: number
  chapter_guid: string
  chapter_title: string
  chapter_subtitle: string
  chapter_order: number
  status: number
  status_text: string
  comment_count: number
  create_date: string
  first_published_date: string
  allow_comment: number
  allow_sticker: number
  allow_anon_comment: number
  baht_price: string
  flexible_pricing_enable: number
  flexible_pricing_description: any
  article_status: number
  article_status_text: string
  article_species: string
  article_species_text: string
  chapter_edition: number
  chapter_thumbnail_edition: number
  chapter_content_thumbnail_edition: number
  unpromoted_cover_image: any
  unpromoted_article_cover_image: number
  unpromoted_article_content_image: any
  unpromoted_article: any
  is_lock: number
  user_id_locker: any
  last_lock_datetime: any
  is_collab: number
  allow_copy_content: number
  thumbnail_edition: number
  unpromoted_content_image: number
  category_id: number
  category_id_v2: number
  category_name: string
  check_id_card: number
  content_rating: number
  is_hide_rating: number
  is_end: number
  article_allow_comment: number
  article_allow_sticker: number
  article_allow_anon_comment: number
  is_accept_donate: number
  publisher_name: string
  publisher_thumbnail_edition: number
  censor_words: number
  is_donee: number
  is_show_release_time: any
  scram_seq_num: number
  category_name_2: string
  category_style: number
  new_category_id: number
  is_fanfic: number
  is_translation: number
  release_datetime: any
  is_released: any
  unpublish_datetime: any
  to_status: any
  is_unpublished: any
  edit_date: string
  word_count: number
  image_count: number
  view_count: number
  bubble_count: number
  word_count_chat: number
  schedule_pricing_enable: number
  schedule_pricing_start_datetime: any
  schedule_baht_price: any
  schedule_pricing_end_datetime: any
  schedule_original_baht_price: any
  allow_tts: number
  forced_disable_donate_status: number
  is_selling: number
  is_ai_cover: string
  chapter_thumbnail_path: any
  enable_yourname: number
  article_thumbnail_path: string
  publisher_thumbnail_path: string
  collaborator_list: any
  user_access: number
  previous_chapter_guid: string
  previous_chapter_content_type: number
  previous_chapter_title: string
  next_chapter_guid: any
  next_chapter_content_type: any
  next_chapter_title: any
  chapter_count: number
  tag_list: TagList[]
  par_id_list: string
  comment_paragraph_version: number
}

export type TagList = {
  tag_id: number
  tag_group_id?: number
  tag_name: string
}

// Chat Chapter Type
export type ArticleContent = {
  last_id_conversation: number
  message_end_of_chapter: string
  last_id_character: number
  character_list: ChapterChatContentCharacterList[]
  conversation_list: ChapterChatContentConversationList[]
}

export type ChapterChatContent = {
  last_id_conversation: number
  message_end_of_chapter: string
  last_id_character: number
  character_list: ChapterChatContentCharacterList[]
  conversation_list: ChapterChatContentConversationList[]
}

export type ChapterChatContentCharacterList = {
  status: any
  unpromoted_image: number
  position: string
  id: number
  imgProfile: any
  lastIndexMessage: number
  conversation_count: number
  img_path_1x: string
  is_hidden: boolean
  img_path_2x: string
  name: string
}

export type ChapterChatContentConversationList = {
  character_id: number
  message?: string
  typing?: number
  conversation_id: number
  position: string
  type: string
  unpromoted_image?: number
  imageMessage: any
  height_img?: number
  width_img?: number
  img_path_1x?: string
  img_path_2x?: string
  gif?: ChapterChatContentGif
  voice?: ChapterChatContentVoice
}

export type ChapterChatContentGif = {
  urlString: string
  dims: number[]
}

export type ChapterChatContentVoice = {
  message: string
  time: string
}
