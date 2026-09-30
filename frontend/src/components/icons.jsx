// A small, self-contained icon set (Heroicons-style outline paths, MIT
// licensed design) so the app isn't leaning on emoji for its UI chrome.
// Every icon is 24x24, stroke-based, and inherits color via currentColor.

function Icon({ children, className = "h-5 w-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ShoppingBagIcon = (props) => (
  <Icon {...props}>
    <path d="M6.5 8h11l1 12.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5L6.5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Icon>
);

export const ArchiveBoxIcon = (props) => (
  <Icon {...props}>
    <rect x="3.5" y="4" width="17" height="4.5" rx="1.2" />
    <path d="M4.5 8.5v9.3A2.2 2.2 0 0 0 6.7 20h10.6a2.2 2.2 0 0 0 2.2-2.2V8.5" />
    <path d="M10 13h4" />
  </Icon>
);

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const UserIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" />
  </Icon>
);

export const Bars3Icon = (props) => (
  <Icon {...props}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </Icon>
);

export const ChevronLeftIcon = (props) => (
  <Icon {...props}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

export const ChevronRightIcon = (props) => (
  <Icon {...props}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const ChevronDownIcon = (props) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const ChevronDoubleLeftIcon = (props) => (
  <Icon {...props}>
    <path d="M17.5 6l-6 6 6 6" />
    <path d="M11 6l-6 6 6 6" />
  </Icon>
);

export const ChevronDoubleRightIcon = (props) => (
  <Icon {...props}>
    <path d="M6.5 6l6 6-6 6" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
);

export const XMarkIcon = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icon>
);

export const CheckCircleIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3l2.4 2.4 4.6-5" />
  </Icon>
);

export const StarIcon = ({ filled, className = "h-5 w-5", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.7L12 3.5Z" />
  </svg>
);

export const MagnifyingGlassIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.35-4.35" />
  </Icon>
);

export const CameraIcon = (props) => (
  <Icon {...props}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.25" />
  </Icon>
);

export const PowerIcon = (props) => (
  <Icon {...props}>
    <path d="M12 4v7" />
    <path d="M7.5 6.5a7 7 0 1 0 9 0" />
  </Icon>
);

export const LockClosedIcon = (props) => (
  <Icon {...props}>
    <rect x="5" y="10.5" width="14" height="9" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Icon>
);

export const EyeSlashIcon = (props) => (
  <Icon {...props}>
    <path d="M3.5 3.5l17 17" />
    <path d="M10.6 5.7A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.6 4.4M6.6 7.1A17.4 17.4 0 0 0 2.5 12S6 18.5 12 18.5a10 10 0 0 0 3.4-.6" />
    <path d="M9.9 10.1a2.75 2.75 0 0 0 3.9 3.9" />
  </Icon>
);

export const EnvelopeIcon = (props) => (
  <Icon {...props}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4.5 7l7.5 6 7.5-6" />
  </Icon>
);

export const PhoneIcon = (props) => (
  <Icon {...props}>
    <path d="M6.5 4h2.2l1.3 4-2 1.4a11.5 11.5 0 0 0 5.6 5.6l1.4-2 4 1.3V16a2 2 0 0 1-2.2 2A15 15 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </Icon>
);

export const TrashIcon = (props) => (
  <Icon {...props}>
    <path d="M4.5 7h15" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M7 7l.8 11.2A2 2 0 0 0 9.8 20h4.4a2 2 0 0 0 2-1.8L17 7" />
    <path d="M10.3 11v5.3M13.7 11v5.3" />
  </Icon>
);

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);

export const HashtagIcon = (props) => (
  <Icon {...props}>
    <path d="M9.5 4l-2 16M16.5 4l-2 16M4.5 9h15M3.5 15h15" />
  </Icon>
);

export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.25" />
  </Icon>
);

export const TagIcon = (props) => (
  <Icon {...props}>
    <path d="M11.5 4h-5A2.5 2.5 0 0 0 4 6.5v5c0 .66.26 1.3.73 1.77l8 8a2.5 2.5 0 0 0 3.54 0l4-4a2.5 2.5 0 0 0 0-3.54l-8-8A2.5 2.5 0 0 0 11.5 4Z" />
    <circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
);

export const PhotoIcon = (props) => (
  <Icon {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4.5 16.5l4.5-4.5 3 3 3.5-3.5 4 4" />
  </Icon>
);

export const ExclamationCircleIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v5" />
    <circle cx="12" cy="16.2" r="0.75" fill="currentColor" stroke="none" />
  </Icon>
);
