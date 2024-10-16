import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/manage/cars')({
  component: () => <div>Hello /admin/manage/cars!</div>,
})
