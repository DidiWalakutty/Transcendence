import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { navigationItems, type UserRole } from './navigation.config';

// temporary hardcoded user role, will be replaced with actual user role from auth context
// will later become something like: const role = session.user.role
const role: UserRole = 'visitor';

export function Navbar() {
  const links = navigationItems[role];

  return (
    <nav
      className="
				sticky 
				top-4 
				z-50
				mx-2
				flex 
				h-16 
				2xl:h-20 
				items-center 
				justify-between
				rounded-xl
				border 
				border-border-default
				bg-surface-card
				px-8
				shadow-md
				text-text-primary
				"
    >
      {/* Logo */}
      <div>
        <a href="/" className="font-bold text-xl 2xl:text-3xl text-brand-primary">
          Eventra
        </a>
      </div>

      <div className="flex items-center gap-8">
        {/* Navigation */}
        {/* All needed links are generated through map based on the user's role */}
        <div className="flex gap-6 text-lg 2xl:text-2xl">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <UserMenu role={role} />
      </div>
    </nav>
  );
}

// when routing to other pages is up:

// import { Link } from "@tanstack/react-router"
// import { Button } from "@/components/ui/button"
// import { LanguageSwitcher } from "./LanguageSwitcher"

// export function Navbar() {
//   return (
//     <nav className="flex w-full items-center justify-between px-8 py-4">

//       {/* Logo */}
//       <Link to="/" className="flex items-center gap-2">
//         <span className="font-bold text-xl">
//           Eventra
//         </span>
//       </Link>

//       {/* Navigation */}
//       <div className="flex gap-6">

//         <Link to="/">
//           Home
//         </Link>

//         <Link to="/events">
//           Events
//         </Link>

//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-4">

//         <LanguageSwitcher />

//         <Link to="/login">
//           <Button>
//             Login
//           </Button>
//         </Link>

//       </div>

//     </nav>
//   )
// }
