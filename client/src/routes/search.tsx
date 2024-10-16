import { SearchForm } from '@/components/home/search-car'
import { CarCard } from '@/components/search/car-card'
import { Separator } from '@/components/ui/separator'
import { car } from '@/data/car'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className='flex flex-col p-4 pt-8 md:p-10 mx-auto'>
      <SearchForm />
      <Separator className='my-8 md:hidden' />
      <div className='mt-4 flex flex-col gap-8'>
        {
          [car, car, car].map((car) => (
            <Link to='/car/$carId' params={{
              carId: car.id,
            }} key={car.id}>
              <CarCard car={car} />
            </Link>
          ))
        }
      </div>
    </div>
  )
}
