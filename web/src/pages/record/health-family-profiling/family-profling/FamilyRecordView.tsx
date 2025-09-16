import React from "react";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { DataTable } from "@/components/ui/table/data-table";
import { dependentViewColumns } from "./FamilyColumns";
import { useLocation } from "react-router";
import { DependentRecord } from "../ProfilingTypes";
import CardLayout from "@/components/ui/card/card-layout";

export default function FamilyRecordView(){

    const location = useLocation();

    const params = React.useMemo(()=> location.state?.params || {}, [location.state]);
    const motherInfo = React.useMemo(() => params.data.mother?.rp || {}, [params.data]);
    const fatherInfo = React.useMemo(() => params.data.father?.rp || {}, [params.data]);

    const formatDependentData = React.useCallback((): DependentRecord[] => {

        const dependents = params.data.dependents
        if (!dependents) return [];

        return dependents.map((dependent: any) => {

            const profile = dependent.rp
            const personalInfo = profile.per

            return {
                id: profile.rp_id || '',
                lname: personalInfo.per_lname || '',
                fname: personalInfo.per_fname || '',
                mname: personalInfo.per_mname || '',
                suffix: personalInfo.per_suffix || '',
                sex: personalInfo.per_sex || '',
                dateOfBirth: personalInfo.per_dob || ''
            }
        })

    }, [params.data.dependents]);

    return (
        <LayoutWithBack
            title="Family Details"
            description="View family details, including family number, date registered and associated members."
        >
            <div className="w-full mb-4">
                <CardLayout 
                    content={
                        <div className="w-full flex justify-between">
                            <Label>Family No. : {params.data.fam_id}</Label>
                            <Label>Indigenous : {params.data.fam_indigenous}</Label>
                            <Label>Household No. : {params.data.hh.hh_id}</Label>
                            <Label>Date Registered : {params.data.fam_date_registered}</Label>
                            <Label>Registered By: {params.data.staff}</Label>
                        </div>
                    }
                />
            </div>

            <div className="w-full flex gap-4 mb-4">
                <CardLayout 
                    title="Father"
                    content={<InfoLayout {...fatherInfo} />}
                    cardClassName="w-full"
                />
                <CardLayout 
                    title="Mother"
                    content={<InfoLayout {...motherInfo} />}
                    cardClassName="w-full"
                />
               
            </div>
            
            <CardLayout 
                title="Dependents"
                content={<DataTable columns={dependentViewColumns()} data={formatDependentData()} />}
            />
        </LayoutWithBack>
    );

}

export const InfoLayout = React.memo((info: any) => (
    <div className="grid gap-2">
        <div className="w-full grid grid-cols-2">
            <Label>Resident (#): {info?.rp_id}</Label>
            <Label>Name: {info?.per?.per_fname} {info?.per?.per_mname} {info?.per?.per_lname}</Label>
            <Label>Date of Birth: {info?.per?.per_dob}</Label>
            <Label>Contact: {info?.per?.per_contact}</Label>
            <Label>Educational Attainment: {info?.per?.per_edAttainment}</Label>
        </div>
    </div>
))