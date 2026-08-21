import { useNavigate } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { libraryService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import LibraryBookBulkActions from '@/pages/library/LibraryBookBulkActions'

const STATUS_LABELS = {
  available: 'Available',
  unavailable: 'Unavailable',
  archived: 'Archived',
}

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'author', header: 'Author' },
  { accessorKey: 'isbn', header: 'ISBN' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'available_copies', header: 'Available' },
  { accessorKey: 'total_copies', header: 'Total' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
  },
]

export default function LibraryBooksPage() {
  const navigate = useNavigate()

  return (
    <ResourceListPage
      title="Book Catalog"
      subtitle="Manage titles, copies, shelf locations and availability"
      breadcrumb={[
        { label: 'Library', href: '/library' },
        { label: 'Book Catalog' },
      ]}
      queryKey="library-books"
      listFn={libraryService.books.list}
      deleteFn={libraryService.books.delete}
      basePath="/library/books"
      columns={columns}
      extraActions={<LibraryBookBulkActions />}
      onView={(item, id) => navigate(`/library/books/${resolveRecordId(item) || id}/edit`)}
    />
  )
}
