import { Menu01, XClose } from '@untitledui/icons'
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { NavLink } from 'react-router'
import { routePaths } from '@/Routes/routePaths'
import type { Category } from '@/types/api'
import { cx } from '@/utils/cx'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cx('block py-3 font-display text-2xl', isActive ? 'text-primary' : 'text-secondary hover:text-primary')

export function MobileNav({ categories }: { categories: Category[] }) {
  return (
    <DialogTrigger>
      <Button aria-label="Open menu" className="inline-flex size-10 items-center justify-center rounded-full text-secondary hover:bg-secondary lg:hidden">
        <Menu01 className="size-5" aria-hidden />
      </Button>
      <ModalOverlay isDismissable className="fixed inset-0 z-50 bg-neutral-950/40 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <Modal className="fixed inset-y-0 left-0 w-[min(22rem,88vw)] bg-primary shadow-2xl entering:animate-in entering:slide-in-from-left exiting:animate-out exiting:slide-out-to-left">
          <Dialog className="flex h-full flex-col p-6 outline-none">
            {({ close }) => (
              <>
                <div className="flex items-center justify-between">
                  <Heading slot="title" className="eyebrow">
                    Menu
                  </Heading>
                  <Button onPress={close} aria-label="Close menu" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-secondary">
                    <XClose className="size-5" aria-hidden />
                  </Button>
                </div>
                <nav aria-label="Mobile" className="mt-6 flex-1" onClick={close}>
                  <NavLink to={routePaths.products} end className={linkClass}>
                    Shop all
                  </NavLink>
                  {categories.map((category) => (
                    <NavLink key={category.id} to={routePaths.category(category.slug)} className={linkClass}>
                      {category.name}
                    </NavLink>
                  ))}
                  <div className="my-4 h-px bg-border-secondary" />
                  <NavLink to={routePaths.about} className={linkClass}>
                    Studio
                  </NavLink>
                  <NavLink to={routePaths.wishlist} className={linkClass}>
                    Wishlist
                  </NavLink>
                  <NavLink to={routePaths.profile} className={linkClass}>
                    Account
                  </NavLink>
                  <NavLink to={routePaths.contact} className={linkClass}>
                    Contact
                  </NavLink>
                </nav>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
