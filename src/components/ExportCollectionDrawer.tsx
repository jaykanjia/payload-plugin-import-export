import { useEffect, useState } from 'react'
import { Data, FormState } from 'payload'
import { Button, CheckboxField, Form, useConfig, Collapsible } from '@payloadcms/ui'
import styles from './ImportExport.module.css'

function buildKeyStructure(data: any) {
  const result = {}

  function traverse(obj: any, target: any) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item, target))
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        const value = obj[key]

        if (typeof value === 'object' && value !== null) {
          target[key] = {}
          traverse(value, target[key])
        } else {
          target[key] = null // or true, "" etc., if you prefer
        }
      }
    }
  }

  traverse(data, result)
  return result
}

const ExportCollectionDrawer = ({ slug, type }: { slug: string; type: string }) => {
  const { config } = useConfig()

  const [data, setData] = useState<Record<string, any> | undefined>(undefined)

  const handleExport = async (fields: FormState, data: Data) => {
    console.log({ fields, data })

    const response = await fetch(`${config.serverURL}${config.routes.api}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        slug,
        fields: data,
      }),
    })

    if (!response.ok) {
      alert('Failed to download CSV')
      return
    }

    const json = await response.json()
    const csvData = json.data

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `export${slug ? `-${slug}` : ''}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch(`${config.serverURL}${config.routes.api}/${slug}`)
      if (response.ok) {
        const { docs } = await response.json()
        const structuredKeys = buildKeyStructure(docs)
        setData(structuredKeys)
      }
    }

    void fetchMessage()
  }, [slug])

  return (
    <Form onSubmit={handleExport} uuid={`${type}-${slug}-export-form`}>
      <div className={styles.exportDrawer}>
        <div className={styles.formFieldsWrapper}>
          {data && <DynamicCheckboxForm data={data} />}
        </div>
        <div>
          <h2>Note</h2>
          <p>
            Select all the fields that you want to export in your csv file. if not selected then it
            will export all the fields that are available.
          </p>
          <Button type="submit">Export</Button>
        </div>
      </div>
    </Form>
  )
}

const DynamicCheckboxForm = ({ data, path = '' }: { data: Record<string, any>; path?: string }) => {
  return (
    <div style={{ marginLeft: path ? 20 : 0 }} className={styles.formFields}>
      {Object.entries(data).map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return (
            <Collapsible key={fullPath} header={<p>{key}</p>} className={styles.marginBottom}>
              <DynamicCheckboxForm data={value} path={fullPath} />
            </Collapsible>
          )
        } else {
          return (
            <CheckboxField
              key={fullPath}
              path={fullPath}
              field={{
                name: fullPath,
                label: key,
              }}
            />
          )
        }
      })}
    </div>
  )
}

export default ExportCollectionDrawer
