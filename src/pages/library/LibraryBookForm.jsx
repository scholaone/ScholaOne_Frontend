import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { libraryService } from '@/api/services'

const FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
  { name: 'author', label: 'Author', type: 'text', required: true },
  { name: 'isbn', label: 'ISBN', type: 'text' },
  { name: 'publisher', label: 'Publisher', type: 'text' },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Fiction, Science, Reference…' },
  { name: 'total_copies', label: 'Total Copies', type: 'number', required: true },
  { name: 'available_copies', label: 'Available Copies', type: 'number' },
  { name: 'shelf_location', label: 'Shelf Location', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Available', value: 'available' },
      { label: 'Unavailable', value: 'unavailable' },
      { label: 'Archived', value: 'archived' },
    ],
  },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function LibraryBookForm() {
  return (
    <ResourceFormPage
      title="Book"
      breadcrumb={[
        { label: 'Library', href: '/library' },
        { label: 'Book' },
      ]}
      queryKey="library-books"
      getFn={libraryService.books.get}
      createFn={libraryService.books.create}
      updateFn={libraryService.books.update}
      basePath="/library/books"
      fields={FIELDS}
      transformLoad={(item) => ({
        title: item.title || '',
        author: item.author || '',
        isbn: item.isbn || '',
        publisher: item.publisher || '',
        category: item.category || '',
        total_copies: item.total_copies ?? 1,
        available_copies: item.available_copies ?? item.total_copies ?? 1,
        shelf_location: item.shelf_location || '',
        status: item.status || 'available',
        notes: item.notes || '',
        is_active: item.is_active ?? true,
      })}
      transformSubmit={(values) => ({
        ...values,
        total_copies: Number(values.total_copies) || 1,
        available_copies: Number(values.available_copies || values.total_copies) || 1,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
