import { envConfigs } from "@/config"
import { Post } from "@/types"
import { APIResponseError, Client } from "@notionhq/client"
import { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints"
import GithubSlugger from "github-slugger"
import { NotionToMarkdown } from "notion-to-md"

type WithAuth<P> = P & {
  auth?: string
}
type NotionAnnotations = {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  underline: boolean
  code: boolean
  color: string
}

type NotionText = {
  content: string
  link: null
}

type NotionRichTextElement = {
  type: string
  text: NotionText
  annotations: NotionAnnotations
  plain_text: string
  href: null
}

type NotionTitleElement = {
  type: string
  text: NotionText
  annotations: NotionAnnotations
  plain_text: string
  href: string
}

type NotionPerson = {
  object: string
  id: string
  name: string
  avatar_url: string
  type: string
  person: { email: string }
}

type NotionMultiSelect = {
  id: string
  name: string
  color: string
}

type NotionPropertyValue = {
  id: string
  type: string
  created_time: string
  last_edited_time?: string
  checkbox?: boolean
  multi_select: NotionMultiSelect[]
  people: NotionPerson[]
  rich_text: NotionRichTextElement[]
  title: NotionTitleElement[]
}

type Properties = {
  [key: string]: NotionPropertyValue
}

type Page = {
  id: string
  url: string
  public_url: string
  properties: Properties
}

export type NotionQueryResponse = Array<Page>

interface NotionInterface {
  // eslint-disable-next-line no-unused-vars
  query(args: Omit<WithAuth<QueryDatabaseParameters>, "database_id">): Promise<Post[]>
  // eslint-disable-next-line no-unused-vars
  getPageMarkdown(pageId: string): Promise<string>
}

class Notion implements NotionInterface {
  readonly databaseId = envConfigs.notion.dataBasePosts as string
  private n2m: NotionToMarkdown
  constructor(protected notion = new Client({ auth: envConfigs.notion.apiKey })) {
    this.n2m = new NotionToMarkdown({ notionClient: notion })
  }

  private handleError(error: unknown): never {
    if (error instanceof APIResponseError) {
      const { name, code, message, status } = error
      throw new Error(`Notion API Error: ${name} (${code}) - ${message}. Status: ${status}`)
    } else if (error instanceof Error) {
      throw new Error(`Unexpected error: ${error.message}`)
    }
    throw new Error("Unknown error occurred")
  }

  async query(args: Omit<WithAuth<QueryDatabaseParameters>, "database_id">): Promise<Post[]> {
    try {
      const { results } = await this.notion.databases.query({
        database_id: this.databaseId,
        ...args,
      })
      return this.normalizeResponseQuery(results as unknown as NotionQueryResponse)
    } catch (error) {
      this.handleError(error)
    }
  }

  async getPageMarkdown(pageId: string): Promise<string> {
    try {
      const mdblocks = await this.n2m.pageToMarkdown(pageId)
      return this.n2m.toMarkdownString(mdblocks).parent
    } catch (error) {
      this.handleError(error)
    }
  }

  private normalizeResponseQuery(rows: NotionQueryResponse): Post[] {
    return rows.filter(this.isValidRow).map(this.mapRowToPost)
  }

  private isValidRow = (row: Page): boolean => {
    return !!(
      row.properties?.Page?.title?.[0]?.text?.content &&
      row.properties?.Authors?.people &&
      row.properties?.Created?.created_time &&
      row.properties?.Description?.rich_text?.[0]?.text?.content &&
      row.properties?.Categories?.multi_select
    )
  }

  private mapRowToPost = (row: Page): Post => {
    const slugger = new GithubSlugger()
    return {
      slug: slugger.slug(row.properties.Page.title[0].text.content),
      page: row.id,
      authors: row.properties.Authors.people,
      title: row.properties.Page.title[0].text.content,
      updated: row.properties.Updated.last_edited_time,
      created: row.properties.Created.created_time,
      description: row.properties.Description.rich_text[0].text.content,
      tags: row.properties.Categories.multi_select.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        slug: slugger.slug(item.name),
      })),
    }
  }
}

export default new Notion()
