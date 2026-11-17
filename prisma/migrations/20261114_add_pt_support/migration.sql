-- PT Support: add nullable PT fields to sections, new translation models

-- Section: add PT fields (nullable — no existing rows affected)
ALTER TABLE "sections" ADD COLUMN "namePt" TEXT;
ALTER TABLE "sections" ADD COLUMN "slugPt" TEXT;
ALTER TABLE "sections" ADD COLUMN "descPt" TEXT;
CREATE UNIQUE INDEX "sections_slugPt_key" ON "sections"("slugPt");

-- Article: translation relation is handled by ArticleTranslation FK (no column needed)

-- ArticleTranslation
CREATE TABLE "article_translations" (
    "id"           TEXT        NOT NULL,
    "articleId"    TEXT        NOT NULL,
    "titlePt"      TEXT        NOT NULL,
    "subtitlePt"   TEXT,
    "bodyPt"       TEXT        NOT NULL,
    "slugPt"       TEXT        NOT NULL,
    "metaTitlePt"  TEXT,
    "metaDescPt"   TEXT,
    "heroAltPt"    TEXT,
    "status"       TEXT        NOT NULL DEFAULT 'AUTO',
    "translatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "article_translations_articleId_key" ON "article_translations"("articleId");
CREATE UNIQUE INDEX "article_translations_slugPt_key"    ON "article_translations"("slugPt");
ALTER TABLE "article_translations"
    ADD CONSTRAINT "article_translations_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GlossaryTerm
CREATE TABLE "glossary_terms" (
    "id"     TEXT NOT NULL,
    "esWord" TEXT NOT NULL,
    "ptWord" TEXT NOT NULL,
    "type"   TEXT NOT NULL DEFAULT 'GLOSSARY',

    CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "glossary_terms_esWord_key" ON "glossary_terms"("esWord");

-- TranslationUsage
CREATE TABLE "translation_usage" (
    "id"        TEXT        NOT NULL,
    "month"     TEXT        NOT NULL,
    "chars"     INTEGER     NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_usage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "translation_usage_month_key" ON "translation_usage"("month");

-- SiteConfig (key-value store)
CREATE TABLE "site_config" (
    "key"   TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("key")
);

-- Seed default config values
INSERT INTO "site_config" ("key", "value") VALUES
    ('pt_mode',              'off'),
    ('translation_provider', 'azure')
ON CONFLICT ("key") DO NOTHING;
