export const MainLayoutComponent = ({title, description, children} : 
    {title: string; description: string; children: React.ReactNode; className?: string}) => {
    return (
        <div className="w-full">
            <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-darkBlue2">{title}</h1>
                <p className="text-xs sm:text-sm text-darkGray">{description}</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-8" />
            {children}
        </div>
    )
}