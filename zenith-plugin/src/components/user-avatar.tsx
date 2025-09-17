interface UserAvatarProps {
  initials: string
}

export function UserAvatar({ initials }: UserAvatarProps) {
  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm flex-shrink-0 text-primary-dark bg-primary-light"
    >
      {initials}
    </div>
  )
}
