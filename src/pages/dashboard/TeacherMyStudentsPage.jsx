import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiSearch, FiUsers } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { getPostLoginPath, isTeacherPortalUser } from '@/utils/authRoles'
import {
  TeacherClassStudentList,
} from '@/components/dashboard/teacher/TeacherDashboardPanels'
import '@/styles/teacher-dashboard.css'

export default function TeacherMyStudentsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const classFromQuery = searchParams.get('class') || ''

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'teacher', 'summary'],
    queryFn: () => dashboardService.teacherSummary(),
    staleTime: 90_000,
    enabled: isTeacherPortalUser(user),
    retry: 0,
    throwOnError: false,
  })

  const dashboard = unwrapData(summaryQuery.data) || {}
  const classTeacher = dashboard.class_teacher || {}
  const sections = classTeacher.sections || []

  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!sections.length) return
    const preferred = classFromQuery && sections.some((s) => s.class_section_id === classFromQuery)
      ? classFromQuery
      : sections[0].class_section_id
    setSelectedSectionId((current) => current || preferred)
  }, [sections, classFromQuery])

  useEffect(() => {
    if (classFromQuery && sections.some((s) => s.class_section_id === classFromQuery)) {
      setSelectedSectionId(classFromQuery)
    }
  }, [classFromQuery, sections])

  useEffect(() => {
    setSearch('')
  }, [selectedSectionId])

  const selectedSection = useMemo(
    () => sections.find((section) => section.class_section_id === selectedSectionId),
    [sections, selectedSectionId],
  )

  const studentsQuery = useQuery({
    queryKey: ['dashboard', 'teacher', 'class-students', selectedSectionId],
    queryFn: () => dashboardService.teacherClassStudents({ class_section_id: selectedSectionId }),
    enabled: Boolean(selectedSectionId) && isTeacherPortalUser(user),
    staleTime: 60_000,
    retry: 0,
    throwOnError: false,
  })

  const studentsPayload = unwrapData(studentsQuery.data) || {}
  const students = studentsPayload.students || selectedSection?.students || []

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) => {
      const haystack = [
        student.full_name,
        student.roll_number,
        student.admission_number,
        student.gender,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [students, search])

  if (!isTeacherPortalUser(user)) {
    return <Navigate to={getPostLoginPath(user)} replace />
  }

  return (
    <div className="teacher-dash w-full min-w-0 max-w-full pb-4">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard/teacher"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--td-purple)] hover:underline"
        >
          <FiArrowLeft aria-hidden />
          Back to dashboard
        </Link>
      </div>

      <div className="teacher-panel mb-5">
        <h1 className="teacher-panel__title text-lg">My Students</h1>
        <p className="teacher-panel__sub">
          Students in the class{classTeacher.total_classes === 1 ? '' : 'es'} where you are the class teacher
        </p>
      </div>

      {summaryQuery.isLoading ? (
        <div className="teacher-panel">
          <div className="teacher-skeleton h-10 w-full max-w-md rounded-lg" />
          <div className="teacher-skeleton mt-4 h-48 w-full rounded-xl" />
        </div>
      ) : !classTeacher.is_class_teacher ? (
        <div className="teacher-panel">
          <p className="teacher-empty text-sm">
            You are not assigned as a class teacher. Ask your school admin to map you under Academics → Class Teachers.
          </p>
        </div>
      ) : (
        <>
          {sections.length > 1 ? (
            <div className="teacher-panel mb-5">
              <label htmlFor="teacher-class-select" className="mb-2 block text-xs font-semibold text-[var(--td-muted)]">
                Select class
              </label>
              <select
                id="teacher-class-select"
                className="w-full max-w-md rounded-lg border border-[var(--td-border)] bg-white px-3 py-2 text-sm text-[var(--td-text)]"
                value={selectedSectionId}
                onChange={(event) => setSelectedSectionId(event.target.value)}
              >
                {sections.map((section) => (
                  <option key={section.class_section_id} value={section.class_section_id}>
                    {section.display_name} ({section.student_count} students)
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="teacher-panel">
            <div className="teacher-panel__head">
              <div>
                <h2 className="teacher-panel__title">
                  {studentsPayload.display_name || selectedSection?.display_name || 'Class'}
                </h2>
                <p className="teacher-panel__sub">
                  {studentsPayload.academic_year_name || selectedSection?.academic_year_name}
                  {' · '}
                  {studentsPayload.student_count ?? selectedSection?.student_count ?? students.length} students
                </p>
              </div>
            </div>

            <div className="teacher-student-toolbar">
              <label className="teacher-student-search" htmlFor="teacher-student-search">
                <FiSearch aria-hidden className="teacher-student-search__icon" />
                <input
                  id="teacher-student-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, roll, or admission no."
                  className="teacher-student-search__input"
                />
              </label>
              <p className="teacher-student-toolbar__count">
                <FiUsers aria-hidden />
                Showing {filteredStudents.length} of {students.length}
              </p>
            </div>

            {studentsQuery.isLoading && selectedSectionId ? (
              <div className="teacher-skeleton h-48 w-full rounded-xl" />
            ) : filteredStudents.length ? (
              <TeacherClassStudentList students={filteredStudents} variant="cards" />
            ) : (
              <p className="teacher-empty text-sm">No students match your search.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
