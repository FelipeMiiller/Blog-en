import React from "react"
import { formatDate } from "@/utils/utils"

import { siteMetadata } from "@/config/siteMetadata"

interface Props {
  created: string
  updated?: string
}

const PostMeta: React.FC<Props> = ({ created, updated }) => {
  return (
    <dl>
      <dt className="sr-only">Published on</dt>
      <dd className="text-base font-medium leading-6 text-muted-foreground">
        {updated ? (
          <time dateTime={updated}>{formatDate(updated, siteMetadata.language)}</time>
        ) : (
          <time dateTime={created}>{formatDate(created)}</time>
        )}
      </dd>
    </dl>
  )
}

export default PostMeta
