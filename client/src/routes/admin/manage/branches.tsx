import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/manage/branches')({
  component: () => <div>Hello /admin/manage/branch!</div>,
})
