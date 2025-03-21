// import api from '@/api/api'

// const donation_record = async (donationInfo: Record<string, any>) => {
//     try {
//         console.log({
//             // don_num
//             don_donorfname: donationInfo.don_donorfname,
//             don_donorlname: donationInfo.don_donorlname,
//             don_item_name: donationInfo.don_item_name,
//             don_qty: parseInt(donationInfo.don_qty),
//             don_description: donationInfo.don_description,
//             don_category: donationInfo.don_category,
//             don_receiver: donationInfo.don_receiver,
//             don_date: new Date().toString(),
//             // ra_id,
//             // feat_id,
//         });

//         const res = await api.post('donation/', {

//         });

//         return res.data.don_num;
//     } catch (err) {
//         console.error(err);
//     }
// };

// export {donation_record}

import api from '@/api/api'

export const donation_record = async (donationInfo: Record<string, any>) => {
    
    try {
        const res = await api.post('donation', {
        // console.log({
            don_num: '1',
            don_donorfname: donationInfo.don_donorfname,
            don_donorlname: donationInfo.don_donorlname,
            don_item_name: donationInfo.don_item_name,
            don_qty: parseInt(donationInfo.don_qty),
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_receiver: donationInfo.don_receiver,
            don_date: new Date().toString(),
            // ra_id,
            // feat_id,
        // })
    })
          
        return res.data.don_num;
        
    } catch (err) {
        console.error(err);
    }
}
