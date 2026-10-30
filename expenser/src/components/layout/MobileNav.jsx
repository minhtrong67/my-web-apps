import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { MOBILE_NAV_ITEMS } from './navConfig';
import { useT } from '../../i18n';

export default function MobileNav() {
  const t = useT();
  return (
    <>
      <nav
        aria-label={t('nav.menu')}
        className="fixed inset-x-0 bottom-0 z-30 bg-surface-container pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto flex h-20 max-w-xl items-stretch justify-around px-2 pb-4 pt-3">
          {MOBILE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex flex-1 flex-col items-center justify-start gap-1 text-label-md ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 items-center justify-center rounded-full transition-[width,background-color] duration-300 ease-spatial-fast group-active:scale-95 ${
                      isActive ? 'w-16 bg-secondary-container text-on-secondary-container' : 'w-8'
                    }`}
                  >
                    <Icon name={item.icon} size={24} fill={isActive} />
                  </span>
                  <span className={isActive ? 'font-semibold' : ''}>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
