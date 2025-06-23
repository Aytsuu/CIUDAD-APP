
export type CommodityRecords = {
    comt_id: number;
    com_name: string;
    comt_qty: string;
    comt_action: string;
    staff: string;
    created_at: string;
  };
  

  export type MedicineRecords = {
    mdt_id: number;
    med_detail: {
      med_name: string;
      minv_dsg: string;
      minv_dsg_unit: string;
      minv_form: string;
    };
    mdt_qty: string;
  
    mdt_action: string;
    staff: string;
    created_at: string;
  };

  export type FirstAidRecords = {
      fat_id: number;
      fa_name: string;
      fdt_qty: string;
      fat_action: string;
      staff: string;
      created_at: string;
    };
    


export type CombinedTransactionRecords = {
  id: number;
  type: 'Vaccine' | 'Immunization';
  name: string;
  batch_number: string;
  quantity: string;
  action: string;
  staff: number;
  created_at: string;
};
