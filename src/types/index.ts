import { Article, Tag, User } from "@prisma/client"

export type ArticleWithRelations = Article & {
  author: Pick<User, "id" | "name">
  tags: Tag[]
}

export type ArticleListItem = Pick<
  Article,
  | "id"
  | "title"
  | "subtitle"
  | "slug"
  | "heroImageUrl"
  | "section"
  | "status"
  | "featured"
  | "publishedAt"
  | "createdAt"
> & {
  author: Pick<User, "id" | "name">
  tags: Tag[]
}

export type CreateArticleInput = {
  title: string
  subtitle?: string
  body: string
  heroImageUrl?: string
  heroImageAlt?: string
  heroCredit?: string
  section: string
  status: string
  featured: boolean
  tags: string[]
}

export type UpdateArticleInput = Partial<CreateArticleInput>
