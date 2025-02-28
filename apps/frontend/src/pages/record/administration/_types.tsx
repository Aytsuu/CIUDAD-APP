export type PermissionKey = "view" | "create"

export type Permissions = {
    [feature: string] : {
        view: boolean
        create: boolean
        update: boolean
        delete: boolean
    }
}