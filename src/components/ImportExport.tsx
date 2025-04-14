'use client'

import { Button, Gutter, useConfig, Drawer, DrawerToggler } from '@payloadcms/ui'
import { useMemo } from 'react'
import styles from './ImportExport.module.css'
import { useParams, usePathname } from 'next/navigation.js'
import ExportCollectionDrawer from './ExportCollectionDrawer.js'

export const ImportExport = () => {
  const params = useParams()
  const pathname = usePathname()

  console.log({ params, pathname })

  const { type, slug } = useMemo(() => {
    return {
      type: params?.segments?.at?.(-2),
      slug: params?.segments?.at(-1),
    }
  }, [params])

  const handleImport = () => {
    window.alert(JSON.stringify({ operation: 'import', type, slug }, undefined, 2))
  }

  return (
    <Gutter>
      <div className={styles.wrapper}>
        <DrawerToggler
          slug={`import-${slug}`}
          style={{ marginBlock: 4 }}
          className="btn btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--style-primary btn--withoutPopup"
        >
          Import
        </DrawerToggler>
        <DrawerToggler
          slug={`export-${slug}`}
          style={{ marginBlock: 4 }}
          className="btn btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--style-primary btn--withoutPopup"
        >
          Export
        </DrawerToggler>
      </div>
      <Drawer slug={`export-${slug}`} title="Export">
        <ExportCollectionDrawer slug={slug!} type={type!} />
      </Drawer>
      <Drawer slug={`import-${slug}`} title="Import">
        <div className={styles.drawer}>
          <Button type="button" onClick={handleImport}>
            Import
          </Button>
        </div>
      </Drawer>
    </Gutter>
  )
}
