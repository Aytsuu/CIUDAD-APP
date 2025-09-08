export type Position = {
    id: string,
    name: string,
    maximum: number,
}

export type Assigned = {
    assi_id: string
    assi_date: string
    assi_permission: string
    feat: any
    pos: Record<string, any>
}

export type Feature = {
    feat_id: string;
    feat_name: string;
    feat_category: string;
};

export type Permission = {
    perm_id: string
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
    assi_id: string
}

export type AdministrationRecord = {
    staff_id: string
    lname: string
    fname: string
    mname: string
    sex: string
    suffix: string
    dateOfBirth: string
    contact: number
    position: string
    dateAssigned: string
    fam: string
}
