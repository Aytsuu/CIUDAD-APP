import { api } from "@/api/api";


// Function to get a valid resident profile ID
const getValidResidentProfileId = async () => {
    // TODO: Replace with actual logged-in user's resident ID from auth context
    return "00017250822"; // Temporary resident ID
};

// Test function to check server connectivity
export const testServerConnection = async () => {
    try {
        console.log("Testing server connection...");
        console.log("Base URL:", api.defaults.baseURL);
        
        // Test certificate endpoint directly (skip root URL test)
        console.log("Testing certificate endpoint...");
        const certResponse = await api.get('clerk/certificate/');
        console.log("Certificate endpoint accessible:", certResponse.status);
        
        // Test business permit endpoint
        console.log("Testing business permit endpoint...");
        const permitResponse = await api.get('clerk/business-permit/');
        console.log("Business permit endpoint accessible:", permitResponse.status);
        
        console.log("✅ All endpoints are accessible!");
        return true;
    } catch (err: any) {
        console.error("Server connection test failed:", err);
        console.error("Error details:", {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            config: {
                url: err.config?.url,
                method: err.config?.method,
                baseURL: err.config?.baseURL
            }
        });
        
        // If it's a 404, the server is reachable but endpoint doesn't exist
        if (err.response?.status === 404) {
            console.log("⚠️ Server is reachable but endpoint returned 404");
            console.log("This might mean the endpoint doesn't exist or requires authentication");
        }
        
        return false;
    }
};

export const addCertificationRequest = async (requestInfo: Record<string, any>, staffId?: string) => {
    try {
        let businessExistenceFileId = null;
        let grossSalesFileId = null;

        // Upload Business Existence Image
        if (requestInfo.business_existence_image && requestInfo.business_existence_image.length > 0) {
            const fileData = requestInfo.business_existence_image[0];

            const fileUploadResponse = await api.post('file/upload/', {
                file_name: fileData.name,
                file_type: fileData.type,
                file_path: fileData.path,
                file_url: fileData.uri
            });

            if (fileUploadResponse.data && fileUploadResponse.data.file_id) {
                businessExistenceFileId = fileUploadResponse.data.file_id;
            }
        }

        // Upload Gross Sales Image
        if (requestInfo.gross_sales_image && requestInfo.gross_sales_image.length > 0) {
            const fileData = requestInfo.gross_sales_image[0];

            const fileUploadResponse = await api.post('file/upload/', {
                file_name: fileData.name,
                file_type: fileData.type,
                file_path: fileData.path,
                file_url: fileData.uri
            });

            if (fileUploadResponse.data && fileUploadResponse.data.file_id) {
                grossSalesFileId = fileUploadResponse.data.file_id;
            }
        }

        // Personal Certification (ClerkCertificate model)
        if (requestInfo.cert_type === 'personal') {
            // Generate a unique cr_id (max 10 characters)
            const timestamp = Date.now().toString();
            const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
            const cr_id = `CR${timestamp.slice(-6)}${randomPart}`;
            
            // Get a valid resident profile ID
            const residentProfileId = await getValidResidentProfileId();
            
            const payload = {
                cr_id: cr_id, 
                cr_req_request_date: new Date().toISOString().split('T')[0], 
                cr_req_claim_date: requestInfo.claim_date,
                cr_req_transac_id: 'None', 
                cr_req_purpose: requestInfo.cert_category, 
                cr_req_status: 'Pending',
                cr_req_payment_status: 'Paid',
                pr_id: requestInfo.pr_id, 
                rp_id: residentProfileId, 
                serial_no: requestInfo.serialNo || null,
                requester: requestInfo.requester || 'Mobile User'
            };

            console.log("Personal Certification Request Payload:", payload);
            console.log("Making POST request to: clerk/certificate/");
            console.log("Full URL:", api.defaults.baseURL + "/clerk/certificate/");

            const res = await api.post('clerk/certificate/', payload);
            console.log("Response received:", res.data);
            return res.data;
        }
        // Permit Certification (BusinessPermitRequest model)
        else if (requestInfo.cert_type === 'permit') {
            // Generate a unique bpr_id (max 10 characters)
            const timestamp = Date.now().toString();
            const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
            const bpr_id = `BPR${timestamp.slice(-6)}${randomPart}`;
            
            const payload = {
                bpr_id: bpr_id, 
                req_request_date: new Date().toISOString().split('T')[0], // Current date
                req_claim_date: requestInfo.claim_date,
                req_transac_id: 'None', // Default value
                req_sales_proof: grossSalesFileId ? String(grossSalesFileId) : '', 
                req_status: 'Pending',
                req_payment_status: 'Unpaid',
                bus_id: requestInfo.business_id, // Business ID - renamed from business to bus_id
                ags_id: requestInfo.ags_id || null, // Annual gross sales ID (optional)
                pr_id: requestInfo.pr_id || null, // Purpose and rate ID (optional)
                // New image fields
                previous_permit_image: requestInfo.previous_permit_image || null,
                assessment_image: requestInfo.assessment_image || null
            };

            console.log("Business Permit Request Payload:", payload);
            console.log("Making POST request to: clerk/business-permit/");
            console.log("Full URL:", api.defaults.baseURL + "/clerk/business-permit/");

            const res = await api.post('clerk/business-permit/', payload);
            console.log("Response received:", res.data);
            return res.data;
        } else {
            throw new Error('Invalid certification type');
        }

    } catch (err: any) {
        console.error("Error submitting certification request:", err);
        console.error("Error details:", {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: {
                url: err.config?.url,
                method: err.config?.method,
                baseURL: err.config?.baseURL,
                headers: err.config?.headers
            }
        });
        
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Server responded with error:", err.response.status, err.response.data);
        } else if (err.request) {
            // The request was made but no response was received
            console.error("No response received from server. Request details:", err.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up request:", err.message);
        }
        
        throw err;
    }
};

// Helper function to create/update business record first
export const createOrUpdateBusiness = async (businessInfo: Record<string, any>) => {
    try {
        const businessPayload = {
            bus_name: businessInfo.business_name,
            bus_address: businessInfo.business_address,
            bus_annual_gross_sales: businessInfo.gross_sales,
            bus_existence_proof: businessInfo.business_existence_file_id || null,
            // Add other business fields as needed
        };

        console.log("Business Payload:", businessPayload);

        // If you have a business_id, update existing business
        if (businessInfo.business_id) {
            const res = await api.put(`clerk/business/${businessInfo.business_id}/`, businessPayload);
            return res.data;
        } else {
            // Create new business
            const res = await api.post('clerk/business/', businessPayload);
            return res.data;
        }
    } catch (err) {
        console.error("Error creating/updating business:", err);
        throw err;
    }
};

// Helper function to format image data for upload
export const formatImageForUpload = (imageUri: string, fileName: string) => {
    return {
        name: fileName,
        type: 'image/jpeg', // You might want to detect this dynamically
        path: imageUri,
        uri: imageUri
    };
};

// Function to validate certification request data
export const validateCertificationRequest = (requestInfo: Record<string, any>) => {
    const errors: string[] = [];

    if (!requestInfo.cert_type) {
        errors.push('Certification type is required');
    }

    if (requestInfo.cert_type === 'personal') {
        if (!requestInfo.cert_category) {
            errors.push('Certification category is required');
        }
    }

    if (requestInfo.cert_type === 'permit') {
        if (!requestInfo.business_name) {
            errors.push('Business name is required');
        }
        if (!requestInfo.business_address) {
            errors.push('Business address is required');
        }
        if (!requestInfo.gross_sales) {
            errors.push('Annual gross sales is required');
        }
    }

    if (!requestInfo.claim_date) {
        errors.push('Claim date is required');
    }

    return errors;
};

// Complete workflow for permit certification with business creation
export const submitPermitCertificationWithBusiness = async (requestInfo: Record<string, any>, staffId?: string) => {
    try {
        // First, create or update business record
        const businessResult = await createOrUpdateBusiness(requestInfo);
        
        // Then submit the permit request with the business ID
        const permitRequest = {
            ...requestInfo,
            business_id: businessResult.bus_id || businessResult.id
        };
        
        return await addCertificationRequest(permitRequest, staffId);
    } catch (err) {
        console.error("Error in complete permit certification workflow:", err);
        throw err;
    }
};