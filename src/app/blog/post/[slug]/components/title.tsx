import React from "react"
import Link from "next/link"
import { Icons, TagsLink } from "@/components"
import { Post } from "@/types"
import { formatDate, readingTime } from "@/utils/utils"

import { siteMetadata } from "@/config/siteMetadata"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Title({ post, markdown }: { post: Post; markdown: string }) {
  const time = readingTime(markdown)
  return (
    <header className="mb-8">
      <Button variant="ghost" className="mb-4 hover:text-primary" asChild>
        <Link href="/blog">
          <Icons.chevronLeft className="w-4 h-4 mr-2" />
          Back to blog
        </Link>
      </Button>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">{post.title}</h1>
      <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-4">
        <div className="flex items-center">
          <Icons.calendar className="w-4 h-4 mr-2" />
          <time dateTime={post.created}>{formatDate(post.created, siteMetadata.language)}</time>
        </div>
        <div className="flex items-center">
          <Icons.clock className="w-4 h-4 mr-2" />
          <span>{time.readingTime} min de leitura</span>
        </div>
        <div className="flex items-center">
          <Icons.reader className="w-4 h-4 mr-2" />
          <span>{time.wordCount} palavras</span>
        </div>
      </div>

      <TagsLink tags={post.tags} />

      <Separator className="my-8" />
    </header>
  )
}
