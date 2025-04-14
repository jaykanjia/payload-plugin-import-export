import { Parser } from 'json2csv'
import { applyFilter, flattenObject } from './utils/helper.js'

const ExportHandler = async (req: any) => {
  try {
    const data = await req.json()

    console.log('data', data)

    if (!req.user) {
      return Response.json({ error: 'forbidden' }, { status: 403 })
    }

    if (!data?.slug || !data?.type) {
      return Response.json({ error: 'type and slug required' }, { status: 400 })
    }

    if (
      data?.type === 'collection' &&
      !Object.keys(req?.payload?.collections).includes(data.slug)
    ) {
      return Response.json(
        { error: `no any collection found with slug, ${data?.slug}` },
        { status: 400 },
      )
    }

    console.log({ collection: req?.payload?.collections })

    const { docs } = await req.payload.find({
      collection: data?.slug,
    })

    let flattenedDocs: any[] = []

    if (data?.fields) {
      flattenedDocs = applyFilter(docs, data?.fields)
    }

    flattenedDocs = flattenedDocs.map((doc: any) => flattenObject(doc))

    const parser = new Parser()
    const csv = parser.parse(flattenedDocs)

    // const filePath = path.join(__dirname, 'export.csv')
    // console.log({ filePath })

    // await fs.writeFile(filePath, csv)

    return Response.json({ data: csv })
  } catch (error: any) {
    return Response.json(
      {
        error: error?.message || 'Something went wrong',
      },
      { status: 500 },
    )
  }
}

export { ExportHandler }

/**
 * const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    author: post.author.name,
    tags: post.tags.map(tag => tag.name).join(', '),
    categories: post.categories.map(cat => cat.name).join(', '),
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }))

  const parser = new Parser()
  const csv = parser.parse(formattedPosts)

  const outputPath = path.join(__dirname, 'posts_export.csv')
  fs.writeFileSync(outputPath, csv)
  console.log('✅ CSV export complete:', outputPath)
 */
