import TemplateMainPage from "@/pages/record/council/templates/template-main"
import TemplatePreview from "@/pages/record/council/templates/template-preview"
import { any } from "zod"

export const template_router = [
    {
        path: '/templates-main',
        element: <TemplateMainPage /> 
    },
    {
        path: '/template-preview',
        element: <TemplatePreview headerImage={""} title={""} body={""} withSeal={false} withSignature={false} onClose={() => false}/>
    }
]