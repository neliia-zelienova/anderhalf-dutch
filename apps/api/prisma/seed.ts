import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Article, PartOfSpeech, Language, PrismaClient } from "../src/generated/client.ts";
import seedData from "../assets/words-a2-ch1-2.json";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface Word {
    title: string;
    article: Article;
    partOfSpeech: PartOfSpeech;
    translations: Partial<Record<Language, string>>;
}

async function main() {
    for (const word of seedData as Word[]) {
        const translations = Object.entries(word.translations).reduce((acc = [], [key, value]) => {
            acc.push({
                language: key as Language,
                translation: value
            });
            return acc;
        }, [] as { language: Language; translation: string }[]);
        await prisma.word.upsert({
            where: { unique_word: { title: word.title, article: word.article, partOfSpeech: word.partOfSpeech } },
            update: {},
            create: {
                title: word.title,
                article: word.article,
                partOfSpeech: word.partOfSpeech,
                translations: {
                    createMany: {
                        data: translations,
                    },
                },
            },
        });
    }
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });