import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/manage/admins')({
  component: () => <div>Hello /admin/manage/admins!</div>,
})
