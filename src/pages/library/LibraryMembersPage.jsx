import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { libraryService } from '@/api/services'
import { getErrorMessage } from '@/api/client'

export default function LibraryMembersPage() {
  const queryClient = useQueryClient()

  const toggleBlock = useMutation({
    mutationFn: ({ id, is_blocked }) => libraryService.members.update(id, { is_blocked: !is_blocked }),
    onSuccess: () => {
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['library-members'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const columns = [
    { accessorKey: 'library_card_number', header: 'Card No.' },
    { accessorKey: 'student_name', header: 'Student' },
    { accessorKey: 'admission_number', header: 'Admission No.' },
    { accessorKey: 'class_section', header: 'Class' },
    { accessorKey: 'books_issued', header: 'Issued Now' },
    { accessorKey: 'issue_limit', header: 'Limit' },
    {
      accessorKey: 'fine_amount',
      header: 'Fine',
      cell: ({ getValue }) => {
        const val = getValue()
        return val ? `₹${val}` : '—'
      },
    },
    {
      accessorKey: 'is_blocked',
      header: 'Status',
      cell: ({ getValue, row }) => {
        if (getValue()) return 'Blocked'
        if (row.original.fine_status === 'pending') return 'Fine pending'
        return 'Active'
      },
    },
    {
      id: 'member_actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const member = row.original
        const id = member.member_id || member.id
        return (
          <Button
            size="sm"
            variant={member.is_blocked ? 'secondary' : 'danger'}
            disabled={toggleBlock.isPending}
            onClick={() => toggleBlock.mutate({ id, is_blocked: member.is_blocked })}
          >
            {member.is_blocked ? 'Unblock' : 'Block'}
          </Button>
        )
      },
    },
  ]

  return (
    <ResourceListPage
      title="Library Members"
      subtitle="Student library cards, issue limits, blocks and outstanding fines"
      breadcrumb={[
        { label: 'Library', href: '/library' },
        { label: 'Members' },
      ]}
      queryKey="library-members"
      listFn={libraryService.members.list}
      basePath="/library/members"
      columns={columns}
      readOnly
      hideCreate
    />
  )
}
