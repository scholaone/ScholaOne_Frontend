export const LIBRARY_BOOK_BULK_IMPORT_COLUMNS = [
  { key: 'title', header: 'Title', required: true },
  { key: 'author', header: 'Author', required: true },
  { key: 'isbn', header: 'ISBN' },
  { key: 'publisher', header: 'Publisher' },
  { key: 'category', header: 'Category' },
  { key: 'total_copies', header: 'Total Copies', type: 'number' },
  { key: 'available_copies', header: 'Available Copies', type: 'number', hint: 'defaults to total copies' },
  { key: 'shelf_location', header: 'Shelf / Accession No.' },
  { key: 'status', header: 'Status', hint: 'available/unavailable/archived' },
  { key: 'notes', header: 'Notes' },
]

export const LIBRARY_BOOK_BULK_IMPORT_EXAMPLE_ROWS = [
  {
    Title: 'The Alchemist',
    Author: 'Paulo Coelho',
    ISBN: '978-0062315007',
    Publisher: 'HarperOne',
    Category: 'Fiction',
    'Total Copies': '5',
    'Available Copies': '5',
    'Shelf / Accession No.': 'A-12-03',
    Status: 'available',
    Notes: 'Popular reading title',
  },
  {
    Title: 'Science Essentials Grade 8',
    Author: 'NCERT Editorial Board',
    ISBN: '',
    Publisher: 'NCERT',
    Category: 'Reference',
    'Total Copies': '10',
    'Available Copies': '10',
    'Shelf / Accession No.': 'REF-08-15',
    Status: 'available',
    Notes: '',
  },
]
