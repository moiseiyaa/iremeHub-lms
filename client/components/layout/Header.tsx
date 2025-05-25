'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Disclosure, Transition, Menu } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  AcademicCapIcon,
  HomeIcon,
  BookOpenIcon,
  InformationCircleIcon,
  PencilIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthProvider';

// Default image for users without an avatar
const DEFAULT_AVATAR = '/images/default-avatar.png';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (
  avatar: { public_id?: string; url: string; } | string | null | undefined | Record<string, unknown>, 
  fallback: string
): string => {
  try {
    if (!avatar) {
      return fallback;
    }
    
    // If avatar is a string (for backward compatibility)
    if (typeof avatar === 'string') {
      return avatar.trim() === '' ? fallback : avatar;
    }
    
    // If avatar is an object with url property
    if (typeof avatar === 'object' && 'url' in avatar && typeof avatar.url === 'string') {
      // Check if the URL is the default placeholder or empty
      const url = avatar.url.trim();
      if (url === '' || url.includes('res.cloudinary.com/demo') || url.includes('default-avatar.jpg')) {
        return fallback;
      }
      return url;
    }
    
    // Handle unexpected formats
    console.log('Unexpected avatar format:', avatar);
    return fallback;
  } catch (error) {
    console.error('Error processing avatar URL:', error);
    return fallback;
  }
};

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Courses', href: '/courses', icon: BookOpenIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
  { name: 'Blog', href: '/blog', icon: PencilIcon },
  { name: 'Contact', href: '/contact', icon: PhoneIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { isAuthenticated, openLoginModal, openRegisterModal, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Disclosure as="nav" className={classNames(
      scrolled 
        ? 'bg-white shadow-lg' 
        : 'bg-white',
      'fixed w-full z-50 transition-all duration-300'
    )}>
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="relative flex h-16 md:h-18 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-secondary hover:text-primary focus:outline-none transition-all duration-200">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-primary transform -translate-x-1/2 group-hover:w-full transition-all duration-300"></span>
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link 
                    href="/" 
                    className="group flex items-center"
                  >
                    <Image 
                      src="/images/iremehub-logo.png" 
                      alt="iremeHub Logo" 
                      width={140} 
                      height={40} 
                      className="transition-all duration-300"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 md:ml-10 sm:block">
                  <div className="flex space-x-0.5 md:space-x-1 lg:space-x-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            isActive
                              ? 'text-primary font-medium'
                              : 'text-gray-700 hover:bg-white hover:text-primary',
                            'group relative px-2 py-1.5 md:px-3 md:py-2 text-sm font-medium transition-all duration-200 flex items-center'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span>{item.name}</span>
                          <span className={classNames(
                            "absolute -bottom-0.5 left-2 right-2 h-0.5 bg-primary",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                            "transform transition-all duration-300"
                          )}></span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        {(() => {
                          try {
                            // Check if user has a valid avatar
                            const hasValidAvatar = user?.avatar && 
                              typeof user.avatar === 'object' && 
                              'url' in user.avatar && 
                              user.avatar.url && 
                              !user.avatar.url.includes('default-avatar.jpg') &&
                              !user.avatar.url.includes('res.cloudinary.com/demo');
                              
                            if (hasValidAvatar) {
                              return (
                                <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200">
                                  <Image
                                    src={getSafeImageUrl(user.avatar, DEFAULT_AVATAR)}
                                    alt={user?.name || 'User profile'}
                                    width={36}
                                    height={36}
                                    className="object-cover h-full w-full"
                                    onError={(e) => {
                                      // If image fails to load, fallback to default avatar
                                      const target = e.target as HTMLImageElement;
                                      target.src = DEFAULT_AVATAR;
                                      // Prevent the error from propagating
                                      e.stopPropagation();
                                    }}
                                    unoptimized={true}
                                    priority={true}
                                  />
                                </div>
                              );
                            } else {
                              // Display default avatar with user's initials if available
                              const userInitials = user?.name 
                                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                : '';
                                
                              if (userInitials) {
                                return (
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                    {userInitials}
                                  </div>
                                );
                              } else {
                                // Fallback to icon if no name available
                                return (
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-colors duration-200">
                                    <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                                  </div>
                                );
                              }
                            }
                          } catch (error) {
                            console.error('Error rendering avatar:', error);
                            return (
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                              </div>
                            );
                          }
                        })()}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                              My Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                  <Link 
                    href="/dashboard" 
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
                              )}
                  >
                              <AcademicCapIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                    Dashboard
                  </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="relative rounded-lg bg-white border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={openRegisterModal}
                      className="relative rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md hover:shadow-primary/20"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Transition
            enter="transition duration-300 ease-out"
            enterFrom="transform -translate-y-4 opacity-0"
            enterTo="transform translate-y-0 opacity-100"
            leave="transition duration-200 ease-in"
            leaveFrom="transform translate-y-0 opacity-100"
            leaveTo="transform -translate-y-4 opacity-0"
          >
            <Disclosure.Panel className="sm:hidden bg-white border-b border-gray-200 rounded-b-xl shadow-xl">
              <div className="space-y-1 px-3 pb-4 pt-2.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-white hover:text-gray-900',
                        'flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 mr-2.5 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </Disclosure.Button>
                  );
                })}
                
                {!isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        openLoginModal();
                        open = false;
                      }}
                      className="w-full text-center py-2.5 rounded-lg font-medium text-sm border border-primary bg-white text-primary hover:bg-gray-50 transition-colors duration-200"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        openRegisterModal();
                        open = false;
                      }}
                      className="w-full text-center py-2.5 rounded-lg font-medium text-sm bg-primary text-white hover:bg-primary/90 transition-colors duration-200 shadow-sm hover:shadow-md hover:shadow-primary/20"
                    >
                      Sign Up
                    </button>
                </div>
                )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
} 