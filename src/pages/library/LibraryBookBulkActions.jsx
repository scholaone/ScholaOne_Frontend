import { useMemo, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import BulkImportModal from '@/components/bulk/BulkImportModal'
import { libraryService } from '@/api/services'
import {
  LIBRARY_BOOK_BULK_IMPORT_COLUMNS,
  LIBRARY_BOOK_BULK_IMPORT_EXAMPLE_ROWS,
} from '@/config/libraryBookBulkImport'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function LibraryBookBulkActions() {
  const [open, setOpen] = useState(false)
  const schoolScope = useSchoolScopedSelection()

  const importFn = useMemo(
    () => (items) =>
      libraryService.books.bulkImport(items, {
        params: { school: schoolScope.schoolId },
        ...schoolScope.listRequestConfig,
      }),
    [schoolScope.listRequestConfig, schoolScope.schoolId],
  )

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Import
      </Button>
      <BulkImportModal
        open={open}
        onClose={() => setOpen(false)}
        title="Import Books"
        entityLabel="book"
        columns={LIBRARY_BOOK_BULK_IMPORT_COLUMNS}
        exampleRows={LIBRARY_BOOK_BULK_IMPORT_EXAMPLE_ROWS}
        scopeSchool
        schoolScope={schoolScope}
        importFn={importFn}
        queryKey="library-books"
        sampleFilename="library-books-import-sample.csv"
        acceptSpreadsheet
        helpText="Upload Excel (.xlsx) or CSV. Shelf / Accession No. is used for shelf location in the catalog. Available copies default to total copies when left blank."
      />
    </>
  )
}
