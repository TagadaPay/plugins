interface UserAvatarProps {
  initials: string
}

export function UserAvatar({ initials }: UserAvatarProps) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-200 text-pink-800 font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}
