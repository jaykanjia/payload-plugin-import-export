// import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { payloadPluginTemplate } from 'payload-plugin-import-export'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { devUser } from './helpers/credentials.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export default buildConfig({
  admin: {
    autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          type: 'text',
          name: 'title',
          label: 'Title',
        },
        {
          type: 'text',
          name: 'content',
          label: 'Content',
        },
        {
          type: 'relationship',
          relationTo: 'author',
          name: 'author',
          label: 'Author',
        },
        {
          type: 'relationship',
          relationTo: 'category',
          name: 'categories',
          label: 'Categories',
          hasMany: true,
        },
        {
          type: 'select',
          name: 'status',
          label: 'Status',
          options: ['draft', 'published', 'archived'],
        },
      ],
    },
    {
      slug: 'author',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'number',
          name: 'age',
          label: 'Age',
        },
      ],
    },
    {
      slug: 'category',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
        {
          type: 'text',
          required: true,
          unique: true,
          name: 'slug',
          label: 'slug',
        },
      ],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI || '',
  // }),
  db: postgresAdapter({
    // Postgres-specific arguments go here.
    // `pool` is required.
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  onInit: async (payload) => {
    await seed(payload)
  },
  plugins: [
    payloadPluginTemplate({
      collections: {
        posts: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
