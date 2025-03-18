export type Assigned = {
    position: string
    assi_id: string
    assi_date: string
    feat: string
    pos: string
    permissions: any
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