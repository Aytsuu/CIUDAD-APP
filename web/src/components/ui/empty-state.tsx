export const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="rounded-full bg-gray-100 p-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
)