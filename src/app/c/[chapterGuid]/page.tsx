type Props = {
  params: Promise<{ chapterGuid: string }>
}

const Page = async ({ params }: Props) => {
  const { chapterGuid } = await params

  return <div>Chapter {chapterGuid}</div>
}

export default Page
