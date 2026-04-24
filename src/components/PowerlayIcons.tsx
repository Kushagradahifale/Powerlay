type IconProps = {
  className?: string;
};

export function IconCube({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3L12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 21.3V12.1m0 0 8.2-4.7M12 12.1 3.8 7.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWrench({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M14.7 6.1a4.2 4.2 0 0 0-5.8 5.8L3.5 17.3a1.6 1.6 0 0 0 2.3 2.3l5.4-5.4a4.2 4.2 0 0 0 5.8-5.8l-2.4 2.4-2.4-2.4 2.5-2.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M12 16V4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 8l5-4 5 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMaterial({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M12 2.7 3.4 7.4 12 12.1l8.6-4.7L12 2.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 7.4V16.6L12 21.3l8.6-4.7V7.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.1v9.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconProcess({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.1-2-3.4-2.3.4a7.7 7.7 0 0 0-1.7-1l-.3-2.3H10.8L10.5 7a7.7 7.7 0 0 0-1.7 1L6.5 7.6l-2 3.4 2 1.1a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.1 2 3.4 2.3-.4a7.7 7.7 0 0 0 1.7 1l.3 2.3h4.4l.3-2.3a7.7 7.7 0 0 0 1.7-1l2.3.4 2-3.4-2-1.1a7.9 7.9 0 0 0-.1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className ?? "h-5 w-5"}
    >
      <path
        d="M3 7h12v10H3V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15 10h4l2 2v5h-6v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 20a1.7 1.7 0 1 0 0-3.4A1.7 1.7 0 0 0 7 20Zm12 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

