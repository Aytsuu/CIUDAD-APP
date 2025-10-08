import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";

export const postdonationreq = async (donationInfo: Record<string, any>) => {
  try {
    const res = await api.post("donation/donation-record/", {
      don_num: donationInfo.don_num,
      don_donor: donationInfo.don_donor,
      don_item_name: donationInfo.don_item_name,
      don_qty: donationInfo.don_qty,
      don_description: donationInfo.don_description,
      don_category: donationInfo.don_category,
      don_date: formatDate(donationInfo.don_date),
      staff: donationInfo.staff,
      don_status: donationInfo.don_status,
    });

    return res.data.don_num;
  } catch (err) {}
};